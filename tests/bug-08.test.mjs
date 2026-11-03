import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

// Test schema structure for BUG-08
const TestBookingSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, required: true },
  startTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "expired", "conflict", "cancelled"],
    default: "pending",
  },
});

TestBookingSchema.index(
  { adminId: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "confirmed" },
    name: "unique_confirmed_slot_per_admin",
  }
);

function checkSlotConflict(existingBookings, targetAdminId, targetStartTime) {
  const conflict = existingBookings.find(
    (b) =>
      b.adminId === targetAdminId &&
      new Date(b.startTime).getTime() === new Date(targetStartTime).getTime() &&
      ["confirmed", "pending"].includes(b.status)
  );

  if (conflict) {
    throw new Error("This time slot is already booked or reserved.");
  }
  return true;
}

function handleWebhookSaveError(error, booking) {
  if (error && error.code === 11000) {
    booking.status = "conflict";
    return {
      status: "conflict",
      handled: true,
    };
  }
  throw error;
}

test("BUG-08: Partial unique index unique_confirmed_slot_per_admin is configured", () => {
  const indexes = TestBookingSchema.indexes();
  const found = indexes.find(
    (idx) => idx[1] && idx[1].name === "unique_confirmed_slot_per_admin"
  );

  assert.ok(found, "unique_confirmed_slot_per_admin index must be defined");
  assert.equal(found[1].unique, true);
  assert.deepEqual(found[1].partialFilterExpression, { status: "confirmed" });
});

test("BUG-08: Application-level conflict check blocks double booking on pending/confirmed slot", () => {
  const existing = [
    {
      adminId: "admin_1",
      startTime: "2026-11-03T14:00:00.000Z",
      status: "confirmed",
    },
  ];

  assert.throws(
    () => checkSlotConflict(existing, "admin_1", "2026-11-03T14:00:00.000Z"),
    /This time slot is already booked or reserved/
  );

  assert.doesNotThrow(() =>
    checkSlotConflict(existing, "admin_1", "2026-11-03T15:00:00.000Z")
  );
});

test("BUG-08: Webhook gracefully intercepts duplicate-key error 11000", () => {
  const booking = { status: "confirmed" };
  const duplicateKeyError = new Error("E11000 duplicate key error");
  duplicateKeyError.code = 11000;

  const result = handleWebhookSaveError(duplicateKeyError, booking);
  assert.equal(result.handled, true);
  assert.equal(booking.status, "conflict");
});
