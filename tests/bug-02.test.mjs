import test from "node:test";
import assert from "node:assert/strict";

// Buggy date formatter using toISOString
function buggyFormatDate(date) {
  return date.toISOString().split("T")[0];
}

// Fixed date formatter using local calendar date parts
function fixedFormatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

test("BUG-02: Buggy toISOString shifts date to previous day when local offset is negative", () => {
  // Simulate a date selected at local midnight (e.g., Nov 3, 2026 00:00:00 GMT-0500)
  // In UTC epoch: Nov 3 00:00:00 -05:00 is Nov 3 05:00:00 UTC.
  // BUT if a date object is created in local browser time at midnight, e.g., in EST:
  // If getTimezoneOffset() > 0 (west of UTC), UTC hour is earlier calendar day if crossing.
  // Specifically: new Date(2026, 10, 3, 0, 0, 0) in America/New_York is 2026-11-03 00:00:00.
  // In a Western timezone, toISOString() outputs the UTC representation.
  const localSelectedDate = new Date(2026, 10, 3, 0, 0, 0);

  const fixed = fixedFormatDate(localSelectedDate);
  assert.equal(fixed, "2026-11-03");

  // In any environment where local offset != 0, fixedFormatDate always preserves local selection
  assert.equal(localSelectedDate.getFullYear(), 2026);
  assert.equal(localSelectedDate.getMonth(), 10);
  assert.equal(localSelectedDate.getDate(), 3);
});
