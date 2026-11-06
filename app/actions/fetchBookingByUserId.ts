"use server";

import connectDB from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Event } from "@/lib/models/Event";
import { verifyUser } from "@/lib/auth/check-auth";
import { Types } from "mongoose";
import { getAuthDb } from "@/lib/db-client";
import { ObjectId } from "mongodb";
import {
  parsePaginationParams,
  buildPaginationResponse,
  withDeterministicSort,
  PaginatedResult,
} from "@/lib/pagination";

export interface ClientBookingItem {
  _id: string;
  userId: string;
  consultationType: "phone" | "video";
  zoomJoinUrl?: string;
  phoneNumber?: string;
  adminId: {
    _id: string;
    name: string;
    email: string;
  } | null;
  eventId: {
    _id: string;
    name: string;
    price: number;
  } | null;
  startTime: string;
  endTime: string;
  createdAt: string;
  status: string;
}

export type UserBookingsResponse = ClientBookingItem[] & {
  upcoming: ClientBookingItem[];
  past: ClientBookingItem[];
  pastPagination: PaginatedResult<ClientBookingItem>;
  totalPast: number;
  totalPages: number;
};

export async function fetchBookingByUserIdAction(
  pageInput: unknown = 1,
  limitInput: unknown = 6,
): Promise<UserBookingsResponse> {
  try {
    const user = await verifyUser();
    await connectDB();
    const userObjectId = new Types.ObjectId(user.id);
    const now = new Date();

    // 1. Parse pagination params for past bookings only
    const { page, limit, skip } = parsePaginationParams(
      { page: pageInput, limit: limitInput },
      6,
    );

    // 2. Query definitions with deterministic sorting
    const upcomingFilter = {
      userId: userObjectId,
      startTime: { $gte: now },
    };
    const upcomingSort = withDeterministicSort({ startTime: 1 }, 1);

    const pastFilter = {
      userId: userObjectId,
      startTime: { $lt: now },
    };
    const pastSort = withDeterministicSort({ startTime: -1 }, -1);

    // 3. Execute count and data queries concurrently
    const [upcomingBookings, totalPast, pastBookings] = await Promise.all([
      Booking.find(upcomingFilter)
        .select(
          "_id userId adminId eventId startTime endTime consultationType zoomJoinUrl phoneNumber status createdAt",
        )
        .populate({
          path: "eventId",
          model: Event,
          select: "name price",
        })
        .sort(upcomingSort)
        .lean(),
      Booking.countDocuments(pastFilter),
      Booking.find(pastFilter)
        .select(
          "_id userId adminId eventId startTime endTime consultationType zoomJoinUrl phoneNumber status createdAt",
        )
        .populate({
          path: "eventId",
          model: Event,
          select: "name price",
        })
        .sort(pastSort)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const allFetched = [...upcomingBookings, ...pastBookings];

    // 4. Batch hydrate admin user info from auth_db
    const adminIds = allFetched.map((b) => new ObjectId(b.adminId));
    const db = getAuthDb();
    const admins = adminIds.length
      ? await db
          .collection("user")
          .find(
            { _id: { $in: adminIds } },
            { projection: { name: 1, email: 1 } },
          )
          .toArray()
      : [];

    const adminsMap = new Map(admins.map((a) => [a._id.toString(), a]));

    const mapBooking = (booking: unknown): ClientBookingItem => {
      const b = booking as Record<string, unknown>;
      const adminIdStr = String(b.adminId);
      const adminData = adminsMap.get(adminIdStr);
      const eventObj =
        b.eventId && typeof b.eventId === "object"
          ? (b.eventId as Record<string, unknown>)
          : null;

      return {
        _id: String(b._id),
        userId: String(b.userId),
        consultationType: (b.consultationType as "phone" | "video") ?? "video",
        zoomJoinUrl: b.zoomJoinUrl ? String(b.zoomJoinUrl) : undefined,
        phoneNumber: b.phoneNumber ? String(b.phoneNumber) : undefined,
        status: String(b.status ?? "confirmed"),
        adminId: adminData
          ? {
              _id: adminData._id.toString(),
              name: adminData.name,
              email: adminData.email,
            }
          : null,
        eventId: eventObj
          ? {
              _id: String(eventObj._id),
              name: String(eventObj.name),
              price: Number(eventObj.price) || 0,
            }
          : null,
        startTime:
          b.startTime instanceof Date
            ? b.startTime.toISOString()
            : String(b.startTime ?? ""),
        endTime:
          b.endTime instanceof Date
            ? b.endTime.toISOString()
            : String(b.endTime ?? ""),
        createdAt:
          b.createdAt instanceof Date
            ? b.createdAt.toISOString()
            : String(b.createdAt ?? ""),
      };
    };

    const mappedUpcoming = upcomingBookings.map(mapBooking);
    const mappedPast = pastBookings.map(mapBooking);

    const pastPagination = buildPaginationResponse<ClientBookingItem>({
      items: mappedPast,
      totalItems: totalPast,
      page,
      limit,
    });

    // Construct response that behaves as an array of all active items
    // and simultaneously exposes .upcoming, .past, and .pastPagination
    const combinedArray = [...mappedUpcoming, ...mappedPast] as UserBookingsResponse;
    combinedArray.upcoming = mappedUpcoming;
    combinedArray.past = mappedPast;
    combinedArray.pastPagination = pastPagination;
    combinedArray.totalPast = totalPast;
    combinedArray.totalPages = pastPagination.totalPages;

    return combinedArray;
  } catch (error) {
    console.error(
      "Error fetching user bookings:",
      (error as Error)?.name,
      (error as Error)?.message,
    );
    const emptyArray = [] as unknown as UserBookingsResponse;
    const emptyPaginated = buildPaginationResponse<ClientBookingItem>({
      items: [],
      totalItems: 0,
      page: 1,
      limit: 6,
    });
    emptyArray.upcoming = [];
    emptyArray.past = [];
    emptyArray.pastPagination = emptyPaginated;
    emptyArray.totalPast = 0;
    emptyArray.totalPages = 0;
    return emptyArray;
  }
}
