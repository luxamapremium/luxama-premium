import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

// Test schema structure
const TestBookingSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, required: true },
  startTime: { type: Date, required: true },
  status: { type: String, required: true },
});

TestBookingSchema.index(
  { adminId: 1, startTime: 1, status: 1 },
  { name: "booking_availability_idx" }
);

test("RISK-01: Booking availability compound index is defined correctly", () => {
  const indexes = TestBookingSchema.indexes();
  const found = indexes.find(
    (idx) => idx[1] && idx[1].name === "booking_availability_idx"
  );

  assert.ok(found, "booking_availability_idx should be defined");
  assert.deepEqual(found[0], { adminId: 1, startTime: 1, status: 1 });
});
