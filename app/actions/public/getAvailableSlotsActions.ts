"use server";

import connectDB from "@/lib/db";
import { Schedule } from "@/lib/models/Schedule";
import { Booking } from "@/lib/models/Booking";
import { Event } from "@/lib/models/Event";
import { Types } from "mongoose";
import { getAdminTimezoneById } from "@/app/actions/timezoneAction";
import { convertToUTC, convertFromUTC } from "@/lib/timezone-converter";

export interface AvailableSlot {
  startTime: Date;
  endTime: Date;
  availableSpots: number;
  isAvailable: boolean;
}

interface TimeRange {
  start: Date;
  end: Date;
}

// Cache for timezone (5 minutes TTL), keyed by adminId
const timezoneCache = new Map<string, { timezone: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function getAvailableSlots(
  adminId: string,
  eventId: string,
  dateString: string,
): Promise<AvailableSlot[]> {
  try {
    await connectDB();

    // Validate IDs
    if (!Types.ObjectId.isValid(adminId)) {
      throw new Error("Invalid adminId");
    }

    if (!Types.ObjectId.isValid(eventId)) {
      throw new Error("Invalid eventId");
    }

    // Validate date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      throw new Error("Invalid date format. Expected YYYY-MM-DD");
    }

    const adminObjectId = new Types.ObjectId(adminId);
    const eventObjectId = new Types.ObjectId(eventId);

    // get timezone by adminId (no auth)
    let adminTimezone = "UTC";

    try {
      const now = Date.now();
      const cached = timezoneCache.get(adminId);

      if (cached && now - cached.timestamp < CACHE_TTL) {
        adminTimezone = cached.timezone;
      } else {
        adminTimezone = await getAdminTimezoneById(adminId);
        timezoneCache.set(adminId, { timezone: adminTimezone, timestamp: now });
      }
    } catch (error) {
      console.warn("Using default timezone UTC:", error);
    }

    // Get event
    const event = await Event.findById(eventObjectId)
      .select("durationMinutes bufferMinutes minimumNoticeMinutes")
      .lean();

    if (!event) {
      throw new Error("Event not found");
    }

    const eventDuration = event.durationMinutes;
    const bufferMinutes = event.bufferMinutes || 0;
    const minimumNoticeMinutes = event.minimumNoticeMinutes || 0;

    // Date handling
    const startOfDay = new Date(`${dateString}T00:00:00.000Z`);
    if (isNaN(startOfDay.getTime())) {
      throw new Error("Invalid date");
    }

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const dayOfWeek = dayNames[startOfDay.getUTCDay()];

    // Get schedule
    const schedule = await Schedule.findOne({
      adminId: adminObjectId,
      dayOfWeek,
    }).lean();

    if (!schedule?.timeSlots?.length) {
      return [];
    }

    const enabledSlots = schedule.timeSlots.filter(
      (slot: any) => slot.isEnabled,
    );

    if (enabledSlots.length === 0) {
      return [];
    }

    // Get bookings
    const existingBookings = await Booking.find(
      {
        adminId: adminObjectId,
        startTime: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["pending", "confirmed"] },
      },
      {
        startTime: 1,
        endTime: 1,
        _id: 0,
      },
    ).lean();

    // Min notice
    const now = new Date();
    const minStartTime = new Date(
      now.getTime() + minimumNoticeMinutes * 60 * 1000,
    );

    // Generate slots
    const allPossibleSlots: TimeRange[] = [];

    const targetDate = new Date(`${dateString}T12:00:00.000Z`);

    for (const timeSlot of enabledSlots) {
      const startTimeStr =
        typeof timeSlot.startTime === "string" && !timeSlot.startTime.includes("T")
          ? timeSlot.startTime
          : convertFromUTC(timeSlot.startTime, adminTimezone);

      const endTimeStr =
        typeof timeSlot.endTime === "string" && !timeSlot.endTime.includes("T")
          ? timeSlot.endTime
          : convertFromUTC(timeSlot.endTime, adminTimezone);

      const dayStart = convertToUTC(startTimeStr, adminTimezone, targetDate);
      const dayEnd = convertToUTC(endTimeStr, adminTimezone, targetDate);

      let currentStart = new Date(dayStart);

      const slotDurationMs = eventDuration * 60 * 1000;
      const stepMs = (eventDuration + bufferMinutes) * 60 * 1000;

      while (currentStart.getTime() + slotDurationMs <= dayEnd.getTime()) {
        allPossibleSlots.push({
          start: new Date(currentStart),
          end: new Date(currentStart.getTime() + slotDurationMs),
        });

        currentStart = new Date(currentStart.getTime() + stepMs);
      }
    }

    // Sort
    allPossibleSlots.sort((a, b) => a.start.getTime() - b.start.getTime());

    const bookedRanges = existingBookings.map((booking) => ({
      start: new Date(booking.startTime),
      end: new Date(booking.endTime),
    }));

    // Filter
    const availableSlots: AvailableSlot[] = [];

    for (const slot of allPossibleSlots) {
      if (slot.start < minStartTime) continue;
      if (slot.start < now) continue;

      let isOverlapping = false;

      for (const booked of bookedRanges) {
        if (slot.start < booked.end && slot.end > booked.start) {
          isOverlapping = true;
          break;
        }
      }

      if (!isOverlapping) {
        availableSlots.push({
          startTime: slot.start,
          endTime: slot.end,
          availableSpots: 1,
          isAvailable: true,
        });
      }
    }

    return availableSlots.slice(0, 50);
  } catch (error) {
    console.error(
      "Error fetching available slots:",
      (error as Error)?.name,
      (error as Error)?.message,
    );
    return [];
  }
}
