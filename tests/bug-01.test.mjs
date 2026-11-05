import test from "node:test";
import assert from "node:assert/strict";
import { toZonedTime, fromZonedTime, format } from "date-fns-tz";

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

test("BUG-01: Calendar-anchored Date causes 1-hour DST drift between winter and summer", () => {
  const timezone = "America/New_York";
  const slotTimeString = "09:00"; // Admin wants 9:00 AM every Monday

  // Suppose admin saved slot in January (EST: UTC-5)
  const winterDate = new Date("2026-01-15T12:00:00Z");
  const storedUtcDate = convertToUTC(slotTimeString, timezone, winterDate);
  // Stored UTC: 14:00 UTC (9:00 EST + 5h)
  assert.equal(storedUtcDate.toISOString(), "2026-01-15T14:00:00.000Z");

  // In July (EDT: UTC-4), if the system reads the stored UTC hour (14:00 UTC):
  // 14:00 UTC in July EDT is 10:00 AM, DRIFTING by 1 hour!
  const summerDate = new Date("2026-07-15T12:00:00Z");
  const summerZoned = toZonedTime(new Date("2026-07-15T14:00:00.000Z"), timezone);
  assert.equal(format(summerZoned, "HH:mm", { timeZone: timezone }), "10:00");

  // Fixed behavior: Storing "09:00" string and computing UTC on appointment date:
  const resolvedSummerUtc = convertToUTC(slotTimeString, timezone, summerDate);
  const resolvedSummerZoned = toZonedTime(resolvedSummerUtc, timezone);
  // Correctly remains 09:00 AM in New York!
  assert.equal(format(resolvedSummerZoned, "HH:mm", { timeZone: timezone }), "09:00");
});

test("BUG-01: Overlap check handles HH:mm strings reliably", () => {
  const nonOverlapping = [
    { startTime: "09:00", endTime: "12:00" },
    { startTime: "13:00", endTime: "17:00" },
  ];
  assert.equal(checkForOverlap(nonOverlapping), false);

  const overlapping = [
    { startTime: "09:00", endTime: "13:30" },
    { startTime: "13:00", endTime: "17:00" },
  ];
  assert.equal(checkForOverlap(overlapping), true);
});

test("BUG-01: Migration correctly extracts HH:mm from legacy Date objects", () => {
  const legacyDate = new Date("2026-01-15T14:00:00.000Z");
  const timezone = "America/New_York";
  const zoned = toZonedTime(legacyDate, timezone);
  const extractedHHMM = format(zoned, "HH:mm", { timeZone: timezone });

  assert.equal(extractedHHMM, "09:00");
});
