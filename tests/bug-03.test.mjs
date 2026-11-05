import test from "node:test";
import assert from "node:assert/strict";

// Simulation of Read-Modify-Write vs Atomic Field Update under concurrency
class ScheduleDoc {
  constructor() {
    this.timeSlots = [
      { id: "slot_1", isEnabled: true },
      { id: "slot_2", isEnabled: true },
    ];
  }

  // Non-atomic: reads state, updates array in memory, writes whole array back
  async readModifyWriteToggle(slotId, isEnabled, delayMs = 10) {
    const snapshot = JSON.parse(JSON.stringify(this.timeSlots));
    await new Promise((r) => setTimeout(r, delayMs));
    const slot = snapshot.find((s) => s.id === slotId);
    if (slot) slot.isEnabled = isEnabled;
    this.timeSlots = snapshot;
  }

  // Atomic: directly mutates the specific slot field without replacing the whole array
  async atomicToggle(slotId, isEnabled, delayMs = 10) {
    await new Promise((r) => setTimeout(r, delayMs));
    const slot = this.timeSlots.find((s) => s.id === slotId);
    if (slot) slot.isEnabled = isEnabled;
  }
}

test("BUG-03: Concurrent Read-Modify-Write causes lost updates", async () => {
  const doc = new ScheduleDoc();

  // Op 1 wants to disable slot_1; Op 2 wants to disable slot_2
  await Promise.all([
    doc.readModifyWriteToggle("slot_1", false, 20),
    doc.readModifyWriteToggle("slot_2", false, 10),
  ]);

  // Because Op 1 read state before Op 2 finished, Op 1 overwrites Op 2's change
  const slot2 = doc.timeSlots.find((s) => s.id === "slot_2");
  // One of the updates was lost!
  assert.equal(slot2?.isEnabled, true); // Lost update!
});

test("BUG-03: Atomic updates preserve all concurrent mutations", async () => {
  const doc = new ScheduleDoc();

  // Both concurrent updates run
  await Promise.all([
    doc.atomicToggle("slot_1", false, 20),
    doc.atomicToggle("slot_2", false, 10),
  ]);

  // Both slots are successfully updated without overwriting each other
  const slot1 = doc.timeSlots.find((s) => s.id === "slot_1");
  const slot2 = doc.timeSlots.find((s) => s.id === "slot_2");
  assert.equal(slot1?.isEnabled, false);
  assert.equal(slot2?.isEnabled, false);
});
