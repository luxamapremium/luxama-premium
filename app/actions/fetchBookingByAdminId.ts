"use server";

import connectDB from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Event } from "@/lib/models/Event";
import { verifyAdmin } from "@/lib/auth/check-auth";
import { Types } from "mongoose";
import { getAuthDb } from "@/lib/db-client";
import { ObjectId } from "mongodb";
import {
  parsePaginationParams,
  buildPaginationResponse,
  withDeterministicSort,
  PaginatedResult,
} from "@/lib/pagination";

export interface AdminBookingItem {
  _id: string;
  consultationType: "phone" | "video";
  zoomStartUrl?: string;
  phoneNumber?: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | null;
  event: {
    _id: string;
    name: string;
    price: number;
  } | null;
  startTime: string;
  endTime: string;
  createdAt: string;
  status: string;
}

export interface AdminBookingsResponse {
  upcoming: AdminBookingItem[];
  past: AdminBookingItem[];
  totalPages: number;
  totalPast: number;
  totalUpcoming: number;
  upcomingPagination: PaginatedResult<AdminBookingItem>;
  pastPagination: PaginatedResult<AdminBookingItem>;
}

export interface FetchAdminBookingsOptions {
  page?: unknown;
  limit?: unknown;
  pastPage?: unknown;
  pastLimit?: unknown;
  upcomingPage?: unknown;
  upcomingLimit?: unknown;
}

export async function fetchBookingByAdminIdAction(
  pageOrOptions: unknown = 1,
  limitArg: unknown = 6,
  upcomingPageArg: unknown = 1,
  upcomingLimitArg: unknown = 6,
): Promise<AdminBookingsResponse> {
  try {
    const admin = await verifyAdmin();
    await connectDB();
    const adminObjectId = new Types.ObjectId(admin.id);
    const now = new Date();

    // Support both positional arguments and options object
    const isOptionsObject =
      typeof pageOrOptions === "object" && pageOrOptions !== null;
    const opts: FetchAdminBookingsOptions = isOptionsObject
      ? (pageOrOptions as FetchAdminBookingsOptions)
      : {};

    const pastPageInput = isOptionsObject
      ? (opts.pastPage ?? opts.page ?? 1)
      : pageOrOptions;
    const pastLimitInput = isOptionsObject
      ? (opts.pastLimit ?? opts.limit ?? 6)
      : limitArg;

    const upcomingPageInput = isOptionsObject
      ? (opts.upcomingPage ?? 1)
      : upcomingPageArg;
    const upcomingLimitInput = isOptionsObject
      ? (opts.upcomingLimit ?? opts.limit ?? 6)
      : upcomingLimitArg;

    // 1. Parse pagination params for past and upcoming bookings
    const parsedPast = parsePaginationParams(
      { page: pastPageInput, limit: pastLimitInput },
      6,
    );
    const parsedUpcoming = parsePaginationParams(
      { page: upcomingPageInput, limit: upcomingLimitInput },
      6,
    );

    // 2. Query definitions with deterministic sorting
    const upcomingFilter = {
      adminId: adminObjectId,
      startTime: { $gte: now },
    };
    const upcomingSort = withDeterministicSort({ startTime: 1 }, 1);

    const pastFilter = {
      adminId: adminObjectId,
      startTime: { $lt: now },
    };
    const pastSort = withDeterministicSort({ startTime: -1 }, -1);

    // 3. Execute count and data queries concurrently
    const [totalUpcoming, upcomingBookings, totalPast, pastBookings] =
      await Promise.all([
        Booking.countDocuments(upcomingFilter),
        Booking.find(upcomingFilter)
          .select(
            "_id userId eventId consultationType zoomStartUrl phoneNumber status startTime endTime createdAt",
          )
          .populate({
            path: "eventId",
            select: "name price",
            model: Event,
          })
          .sort(upcomingSort)
          .skip(parsedUpcoming.skip)
          .limit(parsedUpcoming.limit)
          .lean(),
        Booking.countDocuments(pastFilter),
        Booking.find(pastFilter)
          .select(
            "_id userId eventId consultationType zoomStartUrl phoneNumber status startTime endTime createdAt",
          )
          .populate({
            path: "eventId",
            select: "name price",
            model: Event,
          })
          .sort(pastSort)
          .skip(parsedPast.skip)
          .limit(parsedPast.limit)
          .lean(),
      ]);

    const allFetched = [...upcomingBookings, ...pastBookings];

    // 4. Batch hydrate client user info from auth_db
    const userIds = allFetched.map((b) => new ObjectId(b.userId));
    const db = getAuthDb();
    const users = userIds.length
      ? await db
          .collection("user")
          .find(
            { _id: { $in: userIds } },
            { projection: { name: 1, email: 1 } },
          )
          .toArray()
      : [];

    const usersMap = new Map(users.map((u) => [u._id.toString(), u]));

    const mapBooking = (booking: unknown): AdminBookingItem => {
      const b = booking as Record<string, unknown>;
      const userIdStr = String(b.userId);
      const userData = usersMap.get(userIdStr);
      const eventObj = b.eventId && typeof b.eventId === "object" ? (b.eventId as Record<string, unknown>) : null;

      return {
        _id: String(b._id),
        consultationType: (b.consultationType as "phone" | "video") ?? "video",
        zoomStartUrl: b.zoomStartUrl ? String(b.zoomStartUrl) : undefined,
        phoneNumber: b.phoneNumber ? String(b.phoneNumber) : undefined,
        status: String(b.status ?? "pending"),
        user: userData
          ? {
              _id: userData._id.toString(),
              name: userData.name,
              email: userData.email,
            }
          : null,
        event: eventObj
          ? {
              _id: String(eventObj._id),
              name: String(eventObj.name),
              price: Number(eventObj.price) || 0,
            }
          : null,
        startTime: b.startTime instanceof Date ? b.startTime.toISOString() : String(b.startTime ?? ""),
        endTime: b.endTime instanceof Date ? b.endTime.toISOString() : String(b.endTime ?? ""),
        createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt ?? ""),
      };
    };

    const mappedUpcoming = upcomingBookings.map(mapBooking);
    const mappedPast = pastBookings.map(mapBooking);

    const upcomingPagination = buildPaginationResponse<AdminBookingItem>({
      items: mappedUpcoming,
      totalItems: totalUpcoming,
      page: parsedUpcoming.page,
      limit: parsedUpcoming.limit,
    });

    const pastPagination = buildPaginationResponse<AdminBookingItem>({
      items: mappedPast,
      totalItems: totalPast,
      page: parsedPast.page,
      limit: parsedPast.limit,
    });

    return {
      upcoming: mappedUpcoming,
      past: mappedPast,
      totalPages: pastPagination.totalPages,
      totalPast,
      totalUpcoming,
      upcomingPagination,
      pastPagination,
    };
  } catch (error) {
    console.error(
      "Error fetching admin bookings:",
      (error as Error)?.name,
      (error as Error)?.message,
    );
    throw new Error("Failed to fetch bookings");
  }
}
