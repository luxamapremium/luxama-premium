import test from "node:test";
import assert from "node:assert/strict";

const formatTimeRange = (start, end) => {
  return `${start} - ${end}`;
};

test("BUG-10: formatTimeRange formats start and end times with separator", () => {
  assert.equal(formatTimeRange("09:00", "17:00"), "09:00 - 17:00");
  assert.equal(formatTimeRange("13:00", "14:30"), "13:00 - 14:30");
});
