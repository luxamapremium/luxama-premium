"use server";

import { revalidatePath } from "next/cache";
import { Schedule } from "@/lib/models/Schedule";
import { verifyAdmin } from "@/lib/auth/check-auth";
import connectDB from "@/lib/db";
import {
  scheduleSchema,
  timeSlotSchema,
  type ScheduleFormData,
  type TimeSlotFormData,
} from "@/lib/schemas/schedule.schema";
import { DAYS_OF_WEEK } from "@/lib/constants/days_of_week";
import { z } from "zod";

const dayOfWeekSchema = z.enum(DAYS_OF_WEEK);

import { getAdminTimezone } from "./timezoneAction";
import { convertToUTC, convertFromUTC } from "@/lib/timezone-converter";
import { isRedirectError } from "next/dist/client/components/redirect-error";

/* ==============================
    SERIALIZER
============================== */
function serializeDocument(doc: any): any {
  if (!doc) return null;

  if (Array.isArray(doc)) {
    return doc.map((item) => serializeDocument(item));
  }

  if (typeof doc !== "object") return doc;

  const plainObj: any = {};
  const source = doc.toObject ? doc.toObject() : doc;

  for (const key in source) {
    const value = source[key];

    if (value && typeof value === "object" && value._bsontype === "ObjectId") {
      plainObj[key] = value.toString();
    } else if (value instanceof Date) {
      plainObj[key] = value.toISOString();
    } else if (value && typeof value === "object") {
      plainObj[key] = serializeDocument(value);
    } else {
      plainObj[key] = value;
    }
  }

  return plainObj;
}

/* ==============================
    OVERLAP CHECK
============================== */
function checkForOverlap(timeSlots: any[]): boolean {
  if (!timeSlots || timeSlots.length <= 1) return false;

  const sorted = [...timeSlots].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  for (let i = 0; i < sorted.length - 1; i++) {
    if (new Date(sorted[i].endTime) > new Date(sorted[i + 1].startTime)) {
      return true;
    }
  }

  return false;
}

/* ==============================
    GET SCHEDULES
============================== */
export async function getAdminSchedules() {
  try {
    const admin = await verifyAdmin();
    await connectDB();

    const timezone = await getAdminTimezone();

    const schedules = await Schedule.find({ adminId: admin.id })
      .sort({ dayOfWeek: 1 })
      .lean()
      .exec();

    const formatted = schedules.map((schedule) => ({
      _id: schedule._id.toString(),
      adminId: schedule.adminId.toString(),
      dayOfWeek: schedule.dayOfWeek,
      timeSlots: (schedule.timeSlots || []).map((slot: any) => ({
        _id: slot._id ? slot._id.toString() : undefined,
        startTime: convertFromUTC(slot.startTime, timezone),
        endTime: convertFromUTC(slot.endTime, timezone),
        isEnabled: slot.isEnabled ?? true,
      })),
    }));

    return { success: true, data: formatted };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error fetching schedules:", error);
    return {
      success: false,
      error: "Failed to fetch schedules",
    };
  }
}

/* ==============================
    UPSERT SCHEDULE
============================== */
export async function upsertSchedule(data: ScheduleFormData) {
  try {
    const admin = await verifyAdmin();
    await connectDB();

    const timezone = await getAdminTimezone();
    const validatedData = scheduleSchema.parse(data);

    const convertedSlots = validatedData.timeSlots.map((slot) => ({
      startTime: convertToUTC(slot.startTime, timezone),
      endTime: convertToUTC(slot.endTime, timezone),
      isEnabled: slot.isEnabled ?? true,
    }));

    const hasOverlap = checkForOverlap(convertedSlots);
    if (hasOverlap) {
      return { success: false, error: "Time slots cannot overlap" };
    }

    const result = await Schedule.findOneAndUpdate(
      { adminId: admin.id, dayOfWeek: validatedData.dayOfWeek },
      {
        adminId: admin.id,
        dayOfWeek: validatedData.dayOfWeek,
        timeSlots: convertedSlots,
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    );

    revalidatePath("/admin/schedule");

    return {
      success: true,
      data: serializeDocument(result),
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error saving schedule:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues?.[0]?.message,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save schedule",
    };
  }
}

/* ==============================
    ADD TIME SLOT
============================== */
export async function addTimeSlot(
  dayOfWeek: string,
  timeSlot: TimeSlotFormData,
) {
  try {
    const admin = await verifyAdmin();
    await connectDB();

    const validatedDay = dayOfWeekSchema.parse(dayOfWeek);
    const timezone = await getAdminTimezone();
    const validated = timeSlotSchema.parse(timeSlot);

    const newSlot = {
      startTime: convertToUTC(validated.startTime, timezone),
      endTime: convertToUTC(validated.endTime, timezone),
      isEnabled: validated.isEnabled ?? true,
    };

    const schedule = await Schedule.findOne({
      adminId: admin.id,
      dayOfWeek: validatedDay,
    });

    const currentSlots = schedule?.timeSlots || [];
    const updatedSlots = [...currentSlots, newSlot];

    const hasOverlap = checkForOverlap(updatedSlots);
    if (hasOverlap) {
      return { success: false, error: "Time slot overlaps" };
    }

    const result = await Schedule.findOneAndUpdate(
      { adminId: admin.id, dayOfWeek: validatedDay },
      { $push: { timeSlots: newSlot } },
      { upsert: true, returnDocument: "after", runValidators: true },
    );

    revalidatePath("/admin/schedule");

    return {
      success: true,
      data: serializeDocument(result),
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error adding slot:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues?.[0]?.message || "Invalid input",
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add slot",
    };
  }
}

/* ==============================
    REMOVE TIME SLOT
============================== */
export async function removeTimeSlot(
  dayOfWeek: string,
  slotIdOrIndex: string | number,
) {
  try {
    const admin = await verifyAdmin();
    await connectDB();

    const validatedDay = dayOfWeekSchema.parse(dayOfWeek);

    const schedule = await Schedule.findOne({
      adminId: admin.id,
      dayOfWeek: validatedDay,
    }).lean();

    if (!schedule) {
      return { success: false, error: "Schedule not found" };
    }

    const timeSlots = schedule.timeSlots || [];

    const targetIndex =
      typeof slotIdOrIndex === "string"
        ? timeSlots.findIndex((s: any) => s._id?.toString() === slotIdOrIndex)
        : slotIdOrIndex;

    if (targetIndex < 0 || targetIndex >= timeSlots.length) {
      return { success: false, error: "Invalid slot index or ID" };
    }

    const targetSlot = timeSlots[targetIndex];
    const pullCondition = targetSlot?._id
      ? { _id: targetSlot._id }
      : {
          startTime: targetSlot.startTime,
          endTime: targetSlot.endTime,
        };

    const result = await Schedule.findOneAndUpdate(
      { adminId: admin.id, dayOfWeek: validatedDay },
      { $pull: { timeSlots: pullCondition } },
      { returnDocument: "after", runValidators: true },
    );

    if (result && (!result.timeSlots || result.timeSlots.length === 0)) {
      await Schedule.deleteOne({
        adminId: admin.id,
        dayOfWeek: validatedDay,
        timeSlots: { $size: 0 },
      });
    }

    revalidatePath("/admin/schedule");

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error removing slot:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues?.[0]?.message || "Invalid day of week",
      };
    }
    return {
      success: false,
      error: "Failed to remove slot",
    };
  }
}

/* ==============================
    UPDATE TIME SLOT
============================== */
export async function updateTimeSlot(
  dayOfWeek: string,
  slotIdOrIndex: string | number,
  timeSlot: TimeSlotFormData,
) {
  try {
    const admin = await verifyAdmin();
    await connectDB();

    const validatedDay = dayOfWeekSchema.parse(dayOfWeek);
    const timezone = await getAdminTimezone();
    const validated = timeSlotSchema.parse(timeSlot);

    const updatedSlot = {
      startTime: convertToUTC(validated.startTime, timezone),
      endTime: convertToUTC(validated.endTime, timezone),
      isEnabled: validated.isEnabled ?? true,
    };

    const schedule = await Schedule.findOne({
      adminId: admin.id,
      dayOfWeek: validatedDay,
    }).lean();

    if (!schedule) {
      return { success: false, error: "Schedule not found" };
    }

    const slots = schedule.timeSlots || [];

    const targetIndex =
      typeof slotIdOrIndex === "string"
        ? slots.findIndex((s: any) => s._id?.toString() === slotIdOrIndex)
        : slotIdOrIndex;

    if (targetIndex < 0 || targetIndex >= slots.length) {
      return { success: false, error: "Invalid slot index or ID" };
    }

    const updatedSlots = [...slots];
    updatedSlots[targetIndex] = updatedSlot;

    const hasOverlap = checkForOverlap(updatedSlots);
    if (hasOverlap) {
      return { success: false, error: "Updated slot overlaps" };
    }

    const targetSlot = slots[targetIndex];
    let updateFilter: any;
    let updateOperator: any;

    if (targetSlot?._id) {
      updateFilter = {
        adminId: admin.id,
        dayOfWeek: validatedDay,
        "timeSlots._id": targetSlot._id,
      };
      updateOperator = {
        $set: {
          "timeSlots.$.startTime": updatedSlot.startTime,
          "timeSlots.$.endTime": updatedSlot.endTime,
          "timeSlots.$.isEnabled": updatedSlot.isEnabled,
        },
      };
    } else {
      updateFilter = { adminId: admin.id, dayOfWeek: validatedDay };
      updateOperator = {
        $set: {
          [`timeSlots.${targetIndex}.startTime`]: updatedSlot.startTime,
          [`timeSlots.${targetIndex}.endTime`]: updatedSlot.endTime,
          [`timeSlots.${targetIndex}.isEnabled`]: updatedSlot.isEnabled,
        },
      };
    }

    const result = await Schedule.findOneAndUpdate(
      updateFilter,
      updateOperator,
      { returnDocument: "after", runValidators: true },
    );

    revalidatePath("/admin/schedule");

    return {
      success: true,
      data: serializeDocument(result),
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error updating slot:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues?.[0]?.message || "Invalid input",
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update slot",
    };
  }
}

/* ==============================
    TOGGLE SLOT
============================== */
export async function toggleTimeSlotStatus(
  dayOfWeek: string,
  slotIdOrIndex: string | number,
  isEnabled: boolean,
) {
  try {
    const admin = await verifyAdmin();
    await connectDB();

    const validatedDay = dayOfWeekSchema.parse(dayOfWeek);

    const schedule = await Schedule.findOne({
      adminId: admin.id,
      dayOfWeek: validatedDay,
    }).lean();

    if (!schedule) {
      return { success: false, error: "Schedule not found" };
    }

    const slots = schedule.timeSlots || [];

    const targetIndex =
      typeof slotIdOrIndex === "string"
        ? slots.findIndex((s: any) => s._id?.toString() === slotIdOrIndex)
        : slotIdOrIndex;

    if (targetIndex < 0 || targetIndex >= slots.length) {
      return { success: false, error: "Invalid slot index or ID" };
    }

    const targetSlot = slots[targetIndex];
    let updateFilter: any;
    let updateOperator: any;

    if (targetSlot?._id) {
      updateFilter = {
        adminId: admin.id,
        dayOfWeek: validatedDay,
        "timeSlots._id": targetSlot._id,
      };
      updateOperator = {
        $set: {
          "timeSlots.$.isEnabled": isEnabled,
        },
      };
    } else {
      updateFilter = { adminId: admin.id, dayOfWeek: validatedDay };
      updateOperator = {
        $set: {
          [`timeSlots.${targetIndex}.isEnabled`]: isEnabled,
        },
      };
    }

    await Schedule.findOneAndUpdate(
      updateFilter,
      updateOperator,
      { returnDocument: "after", runValidators: true },
    );

    revalidatePath("/admin/schedule");

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error toggling slot:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues?.[0]?.message || "Invalid day of week",
      };
    }
    return {
      success: false,
      error: "Failed to toggle slot",
    };
  }
}
