import * as z from "zod";
import { EVENTS_CATEGORIES } from "@/lib/constants/event-categories";

export const eventSchema = z
  .object({
    name: z.enum(EVENTS_CATEGORIES).default("Immigration & USCIS Services"),
    description: z.string().optional(),

    isFree: z.boolean().default(false),

    // Accept any non-negative number here; the superRefine enforces the real rule
    price: z.coerce
      .number()
      .min(0, "Price cannot be negative")
      .max(10000, "Price cannot exceed $10,000")
      .default(0),

    durationMinutes: z.coerce
      .number()
      .min(30, "Duration must be at least 30 minutes")
      .max(480, "Duration cannot exceed 8 hours"),

    bufferMinutes: z.coerce
      .number()
      .min(10, "Buffer time must be at least 10 minutes")
      .max(120, "Buffer too long"),

    minimumNoticeMinutes: z.coerce
      .number()
      .min(60, "Minimum notice must be at least 60 minutes")
      .max(480, "Minimum notice too long"),

    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    // When NOT free, price must be positive
    if (!data.isFree && data.price <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price must be greater than $0 for paid consultations",
        path: ["price"],
      });
    }
  });

export type EventFormData = z.input<typeof eventSchema>;
