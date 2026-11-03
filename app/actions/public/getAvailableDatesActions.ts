"use server";

import connectDB from "@/lib/db";
import { Types } from "mongoose";
import { Schedule } from "@/lib/models/Schedule";
import { Booking } from "@/lib/models/Booking";
import { getAdminTimezoneById } from "@/app/actions/timezoneAction";
import { convertToUTC, convertFromUTC } from "@/lib/timezone-converter";

interface AvailableDate {
  date: string;
  dayOfWeek: string;
  availableSlots: number;
}

const MAX_DAYS_AHEAD = 60;

// SAFER timezone conversion (no string parsing)
function toAdminTz(date: Date, timezone: string): Date {
  return new Date(date.toLocaleString("en-US", { timeZone: timezone }));
}

function getDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getAvailableDates(
  adminId: string,
  startDate?: Date,
  endDate?: Date,
  maxBookingsPerSlot: number = 1,
): Promise<AvailableDate[]> {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(adminId)) {
      throw new Error("Invalid adminId");
    }

    const adminObjectId = new Types.ObjectId(adminId);

    // FIXED: get timezone WITHOUT auth
    let adminTimezone = "UTC";
    try {
      adminTimezone = await getAdminTimezoneById(adminId);
    } catch {
      console.warn("Fallback to UTC timezone");
    }

    const now = new Date();
    const nowInTz = toAdminTz(now, adminTimezone);

    const today = new Date(
      nowInTz.getFullYear(),
      nowInTz.getMonth(),
      nowInTz.getDate(),
    );

    // sanitize range
    let start = startDate ? toAdminTz(startDate, adminTimezone) : today;
    let end = endDate ? toAdminTz(endDate, adminTimezone) : null;

    if (start < today) start = today;

    if (!end) {
      end = new Date(start);
      end.setDate(end.getDate() + 30);
    }

    const daysDiff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff > MAX_DAYS_AHEAD) {
      end = new Date(start);
      end.setDate(end.getDate() + MAX_DAYS_AHEAD);
    }

    // Generate date list
    const dates: string[] = [];
    const daysSet = new Set<number>();

    const cursor = new Date(start);

    while (cursor <= end) {
      const dateStr = getDateString(cursor);
      dates.push(dateStr);
      daysSet.add(cursor.getDay());

      cursor.setDate(cursor.getDate() + 1);
    }

    if (!dates.length) return [];

    // Get schedules
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const dayNamesInRange = Array.from(daysSet).map((d) => dayNames[d]);

    const schedules = await Schedule.find({
      adminId: adminObjectId,
      dayOfWeek: { $in: dayNamesInRange },
    }).lean();

    const scheduleMap = new Map(schedules.map((s) => [s.dayOfWeek, s]));

    // Get bookings
    const startUTC = new Date(dates[0] + "T00:00:00.000Z");
    const endUTC = new Date(dates[dates.length - 1] + "T23:59:59.999Z");

    const bookings = await Booking.find(
      {
        adminId: adminObjectId,
        startTime: { $gte: startUTC, $lte: endUTC },
        status: { $nin: ["cancelled", "rejected"] },
      },
      { startTime: 1 },
    ).lean();

    // Group bookings by date
    const bookingsMap = new Map<string, Map<number, number>>();

    for (const booking of bookings) {
      const utcDate = new Date(booking.startTime);
      const localDate = toAdminTz(utcDate, adminTimezone);

      const dateKey = getDateString(localDate);

      if (!bookingsMap.has(dateKey)) {
        bookingsMap.set(dateKey, new Map());
      }

      const slotTime = utcDate.getTime();

      const dateBookings = bookingsMap.get(dateKey)!;
      dateBookings.set(slotTime, (dateBookings.get(slotTime) || 0) + 1);
    }

    // Build result
    const results: AvailableDate[] = [];

    for (const dateStr of dates) {
      const [y, m, d] = dateStr.split("-").map(Number);

      const dateObj = new Date(y, m - 1, d);
      const dayName = dayNames[dateObj.getDay()];

      const schedule = scheduleMap.get(dayName);
      if (!schedule?.timeSlots?.length) continue;

      const enabledSlots = schedule.timeSlots.filter((s: any) => s.isEnabled);

      if (!enabledSlots.length) continue;

      const bookingsForDate = bookingsMap.get(dateStr) || new Map();

      let availableCount = 0;

      const targetDate = new Date(`${dateStr}T12:00:00.000Z`);

      for (const slot of enabledSlots) {
        const timeHHMM =
          typeof slot.startTime === "string" && !slot.startTime.includes("T")
            ? slot.startTime
            : convertFromUTC(slot.startTime, adminTimezone);

        const slotUTC = convertToUTC(timeHHMM, adminTimezone, targetDate);
        const timestamp = slotUTC.getTime();
        const booked = bookingsForDate.get(timestamp) || 0;

        if (booked < maxBookingsPerSlot) {
          availableCount++;
        }
      }

      if (availableCount > 0) {
        results.push({
          date: dateStr,
          dayOfWeek: dayName,
          availableSlots: availableCount,
        });
      }
    }

    return results;
  } catch (error) {
    console.error(
      "Error fetching available dates:",
      (error as Error)?.name,
      (error as Error)?.message,
    );
    return [];
  }
}
