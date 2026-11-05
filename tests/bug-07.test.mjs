import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const dayOfWeekSchema = z.enum(DAYS_OF_WEEK);

test("BUG-07: dayOfWeekSchema rejects invalid day names and NoSQL injection objects", () => {
  // Valid days pass
  assert.equal(dayOfWeekSchema.parse("Monday"), "Monday");
  assert.equal(dayOfWeekSchema.parse("Sunday"), "Sunday");

  // Invalid strings throw ZodError
  assert.throws(() => {
    dayOfWeekSchema.parse("NotADay");
  }, z.ZodError);

  // Injection object payload throws ZodError
  assert.throws(() => {
    dayOfWeekSchema.parse({ $ne: null });
  }, z.ZodError);
});
