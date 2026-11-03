import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Buggy schema using ASCII string comparison
const buggySchema = z
  .object({
    startTime: z.string().regex(TIME_REGEX),
    endTime: z.string().regex(TIME_REGEX),
    isEnabled: z.boolean().default(true),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "End time must be after start time",
  });

// Fixed schema using minute comparison and normalization
const fixedSchema = z
  .object({
    startTime: z
      .string()
      .regex(TIME_REGEX, "Invalid time format")
      .transform((val) => val.padStart(5, "0")),
    endTime: z
      .string()
      .regex(TIME_REGEX, "Invalid time format")
      .transform((val) => val.padStart(5, "0")),
    isEnabled: z.boolean().default(true),
  })
  .refine((data) => toMinutes(data.startTime) < toMinutes(data.endTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

test("BUG-06: Buggy schema fails on valid 9:00 to 10:00 and passes invalid 14:00 to 9:00", () => {
  // Buggy schema fails on 9:00 < 10:00 because '9' > '1'
  assert.throws(() => {
    buggySchema.parse({ startTime: "9:00", endTime: "10:00" });
  });

  // Buggy schema incorrectly allows 14:00 start with 9:00 end because '1' < '9'
  assert.doesNotThrow(() => {
    buggySchema.parse({ startTime: "14:00", endTime: "9:00" });
  });
});

test("BUG-06: Fixed schema accepts 9:00 to 10:00 and rejects 14:00 to 9:00", () => {
  const parsed = fixedSchema.parse({ startTime: "9:00", endTime: "10:00" });
  assert.equal(parsed.startTime, "09:00");
  assert.equal(parsed.endTime, "10:00");

  assert.throws(() => {
    fixedSchema.parse({ startTime: "14:00", endTime: "9:00" });
  }, /End time must be after start time/);
});
