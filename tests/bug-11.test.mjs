import test from "node:test";
import assert from "node:assert/strict";

// Array of slots with subdocument IDs
const createSlots = () => [
  { _id: "slot_0", startTime: "09:00", endTime: "11:00", isEnabled: true },
  { _id: "slot_1", startTime: "12:00", endTime: "14:00", isEnabled: true },
  { _id: "slot_2", startTime: "15:00", endTime: "17:00", isEnabled: true },
];

// Target by index (buggy)
function toggleByIndex(slots, index, isEnabled) {
  if (index < 0 || index >= slots.length) return false;
  slots[index].isEnabled = isEnabled;
  return true;
}

// Target by subdocument _id (fixed)
function toggleById(slots, id, isEnabled) {
  const slot = slots.find((s) => s._id === id);
  if (!slot) return false;
  slot.isEnabled = isEnabled;
  return true;
}

test("BUG-11: Index-based mutation targets the wrong slot when array shifts", () => {
  const slots = createSlots();
  // Suppose user intended to disable slot_1 (currently index 1)
  const targetId = "slot_1";
  const targetIndex = 1;

  // Concurrent action deletes slot_0 (index 0)
  slots.splice(0, 1);
  // slots is now: [ { _id: 'slot_1' }, { _id: 'slot_2' } ]

  // Index-based mutation operates on targetIndex = 1
  toggleByIndex(slots, targetIndex, false);

  // BUG: slot_2 was mutated instead of intended slot_1!
  assert.equal(slots[1]._id, "slot_2");
  assert.equal(slots[1].isEnabled, false); // Wrong slot disabled!
  assert.equal(slots[0]._id, "slot_1");
  assert.equal(slots[0].isEnabled, true); // Target was untouched!
});

test("BUG-11: ID-based mutation targets the correct slot even after array shifts", () => {
  const slots = createSlots();
  const targetId = "slot_1";

  // Concurrent action deletes slot_0 (index 0)
  slots.splice(0, 1);

  // ID-based mutation targets slot_1
  toggleById(slots, targetId, false);

  // Correct slot is disabled regardless of position shift
  assert.equal(slots.find((s) => s._id === targetId)?.isEnabled, false);
  assert.equal(slots.find((s) => s._id === "slot_2")?.isEnabled, true);
});
