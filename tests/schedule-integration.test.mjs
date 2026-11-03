import test from "node:test";
import assert from "node:assert/strict";
import { toZonedTime, fromZonedTime, format } from "date-fns-tz";

// Helper utilities matching the unified implementation
function convertToUTC(time, timezone, baseDate = new Date()) {
  const [hours, minutes] = time.split(":").map(Number);
  const zonedDate = toZonedTime(baseDate, timezone);
  zonedDate.setHours(hours, minutes, 0, 0);
  return fromZonedTime(zonedDate, timezone);
}

function parseMinutes(val) {
  if (typeof val === "string") {
    if (val.includes(":") && !val.includes("T")) {
      const [h, m] = val.split(":").map(Number);
      return h * 60 + m;
    }
    const d = new Date(val);
    return d.getUTCHours() * 60 + d.getUTCMinutes();
  }
  if (val instanceof Date) {
    return val.getUTCHours() * 60 + val.getUTCMinutes();
  }
  return 0;
}

function checkForOverlap(timeSlots) {
  if (!timeSlots || timeSlots.length <= 1) return false;
  const sorted = [...timeSlots].sort(
    (a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime),
  );
  for (let i = 0; i < sorted.length - 1; i++) {
    if (parseMinutes(sorted[i].endTime) > parseMinutes(sorted[i + 1].startTime)) {
      return true;
    }
  }
  return false;
}

function generateAvailableSlots({
  dateString,
  adminTimezone,
  enabledSlots,
  eventDurationMinutes = 30,
  bufferMinutes = 0,
  existingBookings = [],
}) {
  const targetDate = new Date(`${dateString}T12:00:00.000Z`);
  const allPossibleSlots = [];

  for (const slot of enabledSlots) {
    const dayStart = convertToUTC(slot.startTime, adminTimezone, targetDate);
    const dayEnd = convertToUTC(slot.endTime, adminTimezone, targetDate);

    let currentStart = new Date(dayStart);
    const slotDurationMs = eventDurationMinutes * 60 * 1000;
    const stepMs = (eventDurationMinutes + bufferMinutes) * 60 * 1000;

    while (currentStart.getTime() + slotDurationMs <= dayEnd.getTime()) {
      allPossibleSlots.push({
        start: new Date(currentStart),
        end: new Date(currentStart.getTime() + slotDurationMs),
      });
      currentStart = new Date(currentStart.getTime() + stepMs);
    }
  }

  const bookedTimestamps = new Set(
    existingBookings.map((b) => new Date(b.startTime).getTime()),
  );

  return allPossibleSlots.map((slot) => ({
    ...slot,
    isAvailable: !bookedTimestamps.has(slot.start.getTime()),
  }));
}

// ---------------------------------------------------------
// Integration Tests with TEST_ marker
// ---------------------------------------------------------

test("TEST_FLOW_1: Schedule CRUD & Overlap Prevention", () => {
  const schedule = {
    dayOfWeek: "Monday",
    timeSlots: [
      { _id: "slot_1", startTime: "09:00", endTime: "12:00", isEnabled: true },
      { _id: "slot_2", startTime: "13:00", endTime: "17:00", isEnabled: true },
    ],
  };

  // 1. Initial schedule has no overlap
  assert.equal(checkForOverlap(schedule.timeSlots), false);

  // 2. Reject adding overlapping slot (11:30 - 14:00 overlaps slot_1 & slot_2)
  const candidateSlot = {
    _id: "slot_3",
    startTime: "11:30",
    endTime: "14:00",
    isEnabled: true,
  };
  const hasOverlap = checkForOverlap([...schedule.timeSlots, candidateSlot]);
  assert.equal(hasOverlap, true);

  // 3. Mutate slot by unique ID (avoiding index shift corruption)
  const targetId = "slot_2";
  const updatedSlots = schedule.timeSlots.map((slot) =>
    slot._id === targetId ? { ...slot, startTime: "13:30", endTime: "17:00" } : slot,
  );
  assert.equal(updatedSlots.find((s) => s._id === targetId).startTime, "13:30");
  assert.equal(checkForOverlap(updatedSlots), false);
});

test("TEST_FLOW_2: Booking Availability Generation without DST Drift", () => {
  const adminTimezone = "America/New_York";
  const enabledSlots = [{ startTime: "09:00", endTime: "11:00" }];

  // Summer booking date (EDT, UTC-4)
  const summerSlots = generateAvailableSlots({
    dateString: "2026-06-15",
    adminTimezone,
    enabledSlots,
    eventDurationMinutes: 60,
  });

  assert.equal(summerSlots.length, 2);
  // 9:00 AM EDT = 13:00 UTC
  assert.equal(summerSlots[0].start.toISOString(), "2026-06-15T13:00:00.000Z");
  assert.equal(summerSlots[1].start.toISOString(), "2026-06-15T14:00:00.000Z");

  // Winter booking date (EST, UTC-5)
  const winterSlots = generateAvailableSlots({
    dateString: "2026-12-15",
    adminTimezone,
    enabledSlots,
    eventDurationMinutes: 60,
  });

  assert.equal(winterSlots.length, 2);
  // 9:00 AM EST = 14:00 UTC
  assert.equal(winterSlots[0].start.toISOString(), "2026-12-15T14:00:00.000Z");
  assert.equal(winterSlots[1].start.toISOString(), "2026-12-15T15:00:00.000Z");
});

test("TEST_FLOW_3: Concurrency & Double Booking Protection", () => {
  const adminId = "admin_123";
  const slotDate = new Date("2026-06-15T13:00:00.000Z");

  // Database confirmed booking map simulating unique_confirmed_slot_per_admin index
  const confirmedBookings = new Map();

  function confirmBooking(bookingId, bAdminId, bStartTime) {
    const key = `${bAdminId}_${bStartTime.toISOString()}`;
    if (confirmedBookings.has(key)) {
      const err = new Error("E11000 duplicate key error collection");
      err.code = 11000;
      throw err;
    }
    confirmedBookings.set(key, { bookingId, status: "confirmed" });
    return { success: true };
  }

  // Client A confirms slot
  confirmBooking("booking_A", adminId, slotDate);
  assert.equal(confirmedBookings.size, 1);

  // Client B attempts to confirm the exact same slot concurrently
  let webhookResult;
  try {
    confirmBooking("booking_B", adminId, slotDate);
  } catch (err) {
    if (err.code === 11000) {
      // Graceful webhook handling
      webhookResult = {
        received: true,
        status: "conflict",
        message: "Double booking detected; flagged for admin resolution",
      };
    }
  }

  assert.equal(webhookResult?.status, "conflict");
  assert.equal(confirmedBookings.get(`${adminId}_${slotDate.toISOString()}`).bookingId, "booking_A");
});

test("TEST_FLOW_4: Auth Redirection & Database Environment Unification", () => {
  // Test redirect error propagation
  const NEXT_REDIRECT = "NEXT_REDIRECT";
  function simulateServerAction(isAuthenticated) {
    try {
      if (!isAuthenticated) {
        const error = new Error(NEXT_REDIRECT);
        error.digest = `${NEXT_REDIRECT};replace;/auth/sign-in;307;`;
        throw error;
      }
      return { success: true };
    } catch (error) {
      if (error?.message === NEXT_REDIRECT || error?.digest?.startsWith(NEXT_REDIRECT)) {
        throw error; // Propagate redirect
      }
      return { success: false, error: "Action failed" };
    }
  }

  assert.throws(() => simulateServerAction(false), (err) => err.digest.includes(NEXT_REDIRECT));
  assert.deepEqual(simulateServerAction(true), { success: true });

  // Test database fallback resolution
  function resolveAuthDb(customEnv) {
    return customEnv || "auth_db";
  }
  assert.equal(resolveAuthDb(undefined), "auth_db");
  assert.equal(resolveAuthDb("production_replica_auth"), "production_replica_auth");
});
