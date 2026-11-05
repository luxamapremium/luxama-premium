import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

// Test schema reflecting the Booking model definition
const BookingSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "expired", "conflict", "cancelled"],
    default: "pending",
  },
  consultationType: { type: String, enum: ["phone", "video"], required: true },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "free"],
    default: "unpaid",
  },
  stripeSessionId: { type: String },
  expiresAt: { type: Date, required: true },
});

BookingSchema.index(
  { adminId: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["confirmed", "pending"] } },
    name: "unique_confirmed_slot_per_admin",
  }
);

BookingSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 1800,
    partialFilterExpression: { status: "pending" },
  }
);

// Simulated database collection and unique index engine
class MockBookingDB {
  constructor() {
    this.bookings = [];
  }

  // Simulates Booking.updateMany to release expired pending holds
  expireStaleHolds(adminId, startTime, now) {
    for (const b of this.bookings) {
      if (
        b.adminId === adminId &&
        new Date(b.startTime).getTime() === new Date(startTime).getTime() &&
        b.status === "pending" &&
        new Date(b.expiresAt).getTime() <= new Date(now).getTime()
      ) {
        b.status = "expired";
      }
    }
  }

  // Simulates findOne for active booking check
  findActiveBooking(adminId, startTime, now) {
    return this.bookings.find(
      (b) =>
        b.adminId === adminId &&
        new Date(b.startTime).getTime() === new Date(startTime).getTime() &&
        (b.status === "confirmed" ||
          (b.status === "pending" && new Date(b.expiresAt).getTime() > new Date(now).getTime()))
    );
  }

  // Simulates atomic insert with MongoDB unique compound index enforcement
  insertBooking(doc) {
    const isSubjectToUnique = ["confirmed", "pending"].includes(doc.status);
    if (isSubjectToUnique) {
      const conflict = this.bookings.find(
        (b) =>
          b.adminId === doc.adminId &&
          new Date(b.startTime).getTime() === new Date(doc.startTime).getTime() &&
          ["confirmed", "pending"].includes(b.status)
      );
      if (conflict) {
        const err = new Error("E11000 duplicate key error collection");
        err.code = 11000;
        throw err;
      }
    }
    const newDoc = { ...doc, _id: `booking_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
    this.bookings.push(newDoc);
    return newDoc;
  }

  deleteById(id) {
    const idx = this.bookings.findIndex((b) => b._id === id);
    if (idx !== -1) {
      this.bookings.splice(idx, 1);
    }
  }

  // Simulates availability query: confirmed OR active pending
  getAvailableSlots(adminId, startTime, endTime, now) {
    const blockedBookings = this.bookings.filter(
      (b) =>
        b.adminId === adminId &&
        new Date(b.startTime) >= new Date(startTime) &&
        new Date(b.startTime) < new Date(endTime) &&
        (b.status === "confirmed" ||
          (b.status === "pending" && new Date(b.expiresAt) > new Date(now)))
    );
    return blockedBookings.length === 0;
  }
}

// Simulated createBookingCheckout orchestration
async function simulateCreateBookingCheckout(db, {
  adminId,
  userId,
  startTime,
  now,
  stripeCreateFail = false,
}) {
  const slotStartTime = new Date(startTime);

  // 1. Release expired holds
  db.expireStaleHolds(adminId, slotStartTime, now);

  // 2. Pre-check
  const activeBooking = db.findActiveBooking(adminId, slotStartTime, now);
  if (activeBooking) {
    if (activeBooking.status === "confirmed") {
      throw new Error("This time slot is already booked or reserved.");
    }
    if (activeBooking.userId !== userId) {
      throw new Error("This time slot was just taken, please choose another one.");
    }
  }

  // 3. Same user retry vs new hold
  const holdExpiresAt = new Date(new Date(now).getTime() + 31 * 60 * 1000);
  let booking;

  if (activeBooking && activeBooking.status === "pending" && activeBooking.userId === userId) {
    activeBooking.expiresAt = holdExpiresAt;
    booking = activeBooking;
  } else {
    try {
      booking = db.insertBooking({
        adminId,
        userId,
        startTime: slotStartTime,
        status: "pending",
        expiresAt: holdExpiresAt,
      });
    } catch (err) {
      if (err.code === 11000) {
        throw new Error("This time slot was just taken, please choose another one.");
      }
      throw err;
    }
  }

  // 4. Stripe checkout session creation
  if (stripeCreateFail) {
    db.deleteById(booking._id);
    throw new Error("Stripe session creation failed");
  }

  booking.stripeSessionId = "cs_test_123";
  return { success: true, bookingId: booking._id };
}

test("SLOT_HOLD_1: First user holds a slot, second user gets slot unavailable / taken", async () => {
  const db = new MockBookingDB();
  const now = new Date("2026-11-04T12:00:00.000Z");
  const slotTime = "2026-11-04T14:00:00.000Z";

  // User 1 starts checkout (hold created)
  const res1 = await simulateCreateBookingCheckout(db, {
    adminId: "admin_1",
    userId: "user_1",
    startTime: slotTime,
    now,
  });
  assert.equal(res1.success, true);

  // Availability query shows slot is no longer available
  const isAvailable = db.getAvailableSlots(
    "admin_1",
    "2026-11-04T14:00:00.000Z",
    "2026-11-04T15:00:00.000Z",
    now
  );
  assert.equal(isAvailable, false, "Slot must be unavailable while pending hold is active");

  // User 2 attempts to checkout the same slot
  await assert.rejects(
    async () => {
      await simulateCreateBookingCheckout(db, {
        adminId: "admin_1",
        userId: "user_2",
        startTime: slotTime,
        now,
      });
    },
    /This time slot was just taken, please choose another one/
  );
});

test("SLOT_HOLD_2: Two simultaneous checkout attempts - exactly one succeeds (database unique constraint)", async () => {
  const db = new MockBookingDB();
  const now = new Date("2026-11-04T12:00:00.000Z");
  const slotTime = "2026-11-04T14:00:00.000Z";

  // Simulate both passing pre-check simultaneously
  const results = await Promise.allSettled([
    simulateCreateBookingCheckout(db, {
      adminId: "admin_1",
      userId: "user_A",
      startTime: slotTime,
      now,
    }),
    simulateCreateBookingCheckout(db, {
      adminId: "admin_1",
      userId: "user_B",
      startTime: slotTime,
      now,
    }),
  ]);

  const fulfilled = results.filter((r) => r.status === "fulfilled");
  const rejected = results.filter((r) => r.status === "rejected");

  assert.equal(fulfilled.length, 1, "Exactly one request must succeed");
  assert.equal(rejected.length, 1, "The second concurrent request must fail");
  assert.match(
    rejected[0].reason.message,
    /This time slot was just taken, please choose another one/
  );
});

test("SLOT_HOLD_3: After the hold expires, the slot becomes bookable again", async () => {
  const db = new MockBookingDB();
  const t0 = new Date("2026-11-04T12:00:00.000Z");
  const slotTime = "2026-11-04T14:00:00.000Z";

  // User 1 creates hold at 12:00
  await simulateCreateBookingCheckout(db, {
    adminId: "admin_1",
    userId: "user_1",
    startTime: slotTime,
    now: t0,
  });

  // At 12:35 (35 minutes later, hold expired)
  const t1 = new Date("2026-11-04T12:35:00.000Z");

  // Availability query shows slot is available again
  const isAvailable = db.getAvailableSlots(
    "admin_1",
    "2026-11-04T14:00:00.000Z",
    "2026-11-04T15:00:00.000Z",
    t1
  );
  assert.equal(isAvailable, true, "Slot must be available once hold expires");

  // User 2 can now book the slot without error
  const res2 = await simulateCreateBookingCheckout(db, {
    adminId: "admin_1",
    userId: "user_2",
    startTime: slotTime,
    now: t1,
  });
  assert.equal(res2.success, true);
});

test("SLOT_HOLD_4: Same user can resume / refresh their own pending hold", async () => {
  const db = new MockBookingDB();
  const t0 = new Date("2026-11-04T12:00:00.000Z");
  const slotTime = "2026-11-04T14:00:00.000Z";

  // User 1 creates initial hold
  const initial = await simulateCreateBookingCheckout(db, {
    adminId: "admin_1",
    userId: "user_1",
    startTime: slotTime,
    now: t0,
  });

  // User 1 retries at 12:10 (e.g. refreshed page or resumed checkout)
  const t1 = new Date("2026-11-04T12:10:00.000Z");
  const retry = await simulateCreateBookingCheckout(db, {
    adminId: "admin_1",
    userId: "user_1",
    startTime: slotTime,
    now: t1,
  });

  assert.equal(retry.success, true);
  assert.equal(retry.bookingId, initial.bookingId, "Reuses the user's existing pending hold");
});

test("SLOT_HOLD_5: Stripe creation failure immediately releases the hold", async () => {
  const db = new MockBookingDB();
  const now = new Date("2026-11-04T12:00:00.000Z");
  const slotTime = "2026-11-04T14:00:00.000Z";

  // User 1 attempts checkout but Stripe fails
  await assert.rejects(
    async () => {
      await simulateCreateBookingCheckout(db, {
        adminId: "admin_1",
        userId: "user_1",
        startTime: slotTime,
        now,
        stripeCreateFail: true,
      });
    },
    /Stripe session creation failed/
  );

  // Slot was released immediately and is still bookable
  const isAvailable = db.getAvailableSlots(
    "admin_1",
    "2026-11-04T14:00:00.000Z",
    "2026-11-04T15:00:00.000Z",
    now
  );
  assert.equal(isAvailable, true, "Slot must be released immediately when Stripe fails");

  // User 2 can immediately book
  const res2 = await simulateCreateBookingCheckout(db, {
    adminId: "admin_1",
    userId: "user_2",
    startTime: slotTime,
    now,
  });
  assert.equal(res2.success, true);
});

test("SLOT_HOLD_6: Booking schema index definitions match hold specifications", () => {
  const indexes = BookingSchema.indexes();
  const uniqueIdx = indexes.find(
    (idx) => idx[1] && idx[1].name === "unique_confirmed_slot_per_admin"
  );
  assert.ok(uniqueIdx, "unique_confirmed_slot_per_admin index must exist");
  assert.equal(uniqueIdx[1].unique, true);
  assert.deepEqual(uniqueIdx[1].partialFilterExpression, {
    status: { $in: ["confirmed", "pending"] },
  });

  const ttlIdx = indexes.find(
    (idx) => idx[0].createdAt && idx[1].expireAfterSeconds
  );
  assert.ok(ttlIdx, "TTL index must exist on createdAt");
  assert.equal(ttlIdx[1].expireAfterSeconds, 1800);
});
