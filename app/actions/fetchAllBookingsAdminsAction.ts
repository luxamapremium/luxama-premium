"use server";

import connectDB from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Event } from "@/lib/models/Event";
import { verifySuperAdmin } from "@/lib/auth/check-auth";
import { getAuthDb } from "@/lib/db-client";
import { ObjectId } from "mongodb";
import {
  parsePaginationParams,
  buildPaginationResponse,
  withDeterministicSort,
  PaginatedResult,
} from "@/lib/pagination";

export interface BookingAuditItem {
  _id: string;
  userId: string;
  adminId: string;
  eventId?: {
    _id?: string;
    name?: string;
    price?: number;
    duration?: number;
  } | null;
  startTime: string;
  endTime: string;
  status: string;
  consultationType: "phone" | "video";
  phoneNumber?: string;
  paymentStatus: string;
  createdAt: string;
  user: { name: string; email: string } | null;
  admin: { name: string; email: string } | null;
  event: {
    _id?: string;
    name?: string;
    price?: number;
    duration?: number;
  } | null;
}

export type FetchAllBookingsResponse = PaginatedResult<BookingAuditItem> & {
  // Backwards-compatibility aliases for existing callers
  bookings: BookingAuditItem[];
  currentPage: number;
  totalBookings: number;
};

export default async function fetchAllBookingsAdminsAction(
  pageInput: unknown = 1,
  limitInput: unknown = 10,
): Promise<FetchAllBookingsResponse> {
  try {
    await verifySuperAdmin();
    await connectDB();

    // 1. Validate pagination params safely with Zod (never throws 500)
    const { page, limit, skip } = parsePaginationParams(
      { page: pageInput, limit: limitInput },
      10,
    );

    // 2. Define identical query filter and deterministic sort
    const filter = {};
    const sort = withDeterministicSort({ createdAt: -1 });

    // 3. Execute count query and items query concurrently with Promise.all
    const [totalBookings, bookings] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.find(filter)
        .populate({
          path: "eventId",
          select: "name price duration",
          model: Event,
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // Handle empty results or out-of-range pages gracefully
    if (!bookings.length) {
      const emptyPaginated = buildPaginationResponse<BookingAuditItem>({
        items: [],
        totalItems: totalBookings,
        page,
        limit,
      });

      return {
        ...emptyPaginated,
        bookings: [],
        currentPage: emptyPaginated.page,
        totalBookings: emptyPaginated.totalItems,
      };
    }

    // 4. Batch hydrate client and admin profiles from auth_db
    const userIds = bookings.map((b) => new ObjectId(b.userId));
    const adminIds = bookings.map((b) => new ObjectId(b.adminId));

    const db = getAuthDb();
    const [users, admins] = await Promise.all([
      db
        .collection("user")
        .find({ _id: { $in: userIds } }, { projection: { name: 1, email: 1 } })
        .toArray(),
      db
        .collection("user")
        .find({ _id: { $in: adminIds } }, { projection: { name: 1, email: 1 } })
        .toArray(),
    ]);

    const usersMap = new Map(users.map((u) => [u._id.toString(), u]));
    const adminsMap = new Map(admins.map((a) => [a._id.toString(), a]));

    const mappedItems: BookingAuditItem[] = bookings.map((booking) => {
      const b = booking as unknown as Record<string, unknown>;
      const userIdStr = String(b.userId);
      const adminIdStr = String(b.adminId);
      const user = usersMap.get(userIdStr);
      const admin = adminsMap.get(adminIdStr);

      return {
        _id: String(b._id),
        userId: userIdStr,
        adminId: adminIdStr,
        startTime: b.startTime instanceof Date ? b.startTime.toISOString() : String(b.startTime ?? ""),
        endTime: b.endTime instanceof Date ? b.endTime.toISOString() : String(b.endTime ?? ""),
        status: String(b.status ?? "pending"),
        consultationType: (b.consultationType as "phone" | "video") ?? "video",
        phoneNumber: b.phoneNumber ? String(b.phoneNumber) : undefined,
        paymentStatus: String(b.paymentStatus ?? "unpaid"),
        createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt ?? ""),
        user: user ? { name: user.name, email: user.email } : null,
        admin: admin ? { name: admin.name, email: admin.email } : null,
        event: b.eventId && typeof b.eventId === "object" ? { ...(b.eventId as object) } : null,
      };
    });

    const serializedItems: BookingAuditItem[] = JSON.parse(
      JSON.stringify(mappedItems),
    );

    const paginated = buildPaginationResponse<BookingAuditItem>({
      items: serializedItems,
      totalItems: totalBookings,
      page,
      limit,
    });

    return {
      ...paginated,
      bookings: paginated.items,
      currentPage: paginated.page,
      totalBookings: paginated.totalItems,
    };
  } catch (error) {
    console.error(
      "Error fetching all bookings:",
      (error as Error)?.name,
      (error as Error)?.message,
    );
    throw new Error("Failed to fetch bookings");
  }
}
