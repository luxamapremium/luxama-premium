import { z } from "zod";
import { DAYS_OF_WEEK } from "@/lib/constants/days_of_week";

// Time validation regex (24-hour format)
export const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Base time slot schema
export const timeSlotSchema = z
  .object({
    startTime: z
      .string()
      .regex(TIME_REGEX, "Invalid time format. Use HH:MM format (e.g., 09:00)")
      .min(1, "Start time is required"),
    endTime: z
      .string()
      .regex(TIME_REGEX, "Invalid time format. Use HH:MM format (e.g., 09:00)")
      .min(1, "End time is required"),
    isEnabled: z.boolean().default(true),
  })
  .refine(
    (data) => {
      return toMinutes(data.startTime) < toMinutes(data.endTime);
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

// Main schedule schema - Updated to handle multiple time slots
export const scheduleSchema = z.object({
  dayOfWeek: z.enum(DAYS_OF_WEEK),
  timeSlots: z
    .array(timeSlotSchema)
    .min(1, "At least one time slot is required"),
});

// Export types
export type TimeSlotFormData = z.input<typeof timeSlotSchema>;
export type ScheduleFormData = z.input<typeof scheduleSchema>;
