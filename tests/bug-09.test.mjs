import test from "node:test";
import assert from "node:assert/strict";

// Simulation of modal state management on action result
class ModalController {
  constructor() {
    this.isOpen = true;
  }

  // Buggy version closes modal unconditionally
  async handleAddSlotBuggy(action) {
    await action();
    this.isOpen = false;
  }

  // Fixed version only closes modal when action succeeds
  async handleAddSlotFixed(action) {
    const success = await action();
    if (success) {
      this.isOpen = false;
    }
  }
}

test("BUG-09: Buggy modal controller closes modal even on action failure", async () => {
  const modal = new ModalController();
  const failedAction = async () => false;

  await modal.handleAddSlotBuggy(failedAction);
  assert.equal(modal.isOpen, false); // Closed despite failure!
});

test("BUG-09: Fixed modal controller keeps modal open on action failure and closes on success", async () => {
  const modal = new ModalController();
  const failedAction = async () => false;
  const successAction = async () => true;

  await modal.handleAddSlotFixed(failedAction);
  assert.equal(modal.isOpen, true); // Stays open on failure!

  await modal.handleAddSlotFixed(successAction);
  assert.equal(modal.isOpen, false); // Closes on success!
});
