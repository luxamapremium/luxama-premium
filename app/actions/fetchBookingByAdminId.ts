"use server";

import connectDB from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Event } from "@/lib/models/Event";
import { verifyAdmin } from "@/lib/auth/check-auth";
import { Types } from "mongoose";
import { getAuthDb } from "@/lib/db-client";
import { ObjectId } from "mongodb";

export async function fetchBookingByAdminIdAction(page = 1, limit = 6) {
  try {
    const admin = await verifyAdmin();
    await connectDB();
    const adminObjectId = new Types.ObjectId(admin.id);
    const now = new Date();

    // 1. Fetch ALL Upcoming (Admin needs these to see what's next)
    const upcomingBookings = await Booking.find({
      adminId: adminObjectId,
      startTime: { $gte: now },
    })
      .populate({
        path: "eventId",
        select: "name price",
        model: Event,
      })
      .sort({ startTime: 1 })
      .lean();

    // 2. Paginate ONLY Past Bookings
    const skip = (page - 1) * limit;
    const totalPastBookings = await Booking.countDocuments({
      adminId: adminObjectId,
      startTime: { $lt: now },
    });

    const pastBookings = await Booking.find({
      adminId: adminObjectId,
      startTime: { $lt: now },
    })
      .populate({
        path: "eventId",
        select: "name price",
        model: Event,
      })
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const allFetched = [...upcomingBookings, ...pastBookings];
    if (!allFetched.length)
      return { upcoming: [], past: [], totalPages: 0, totalPast: 0 };

    // Fetch user details (the clients) from auth_db
    const userIds = allFetched.map((b: any) => new ObjectId(b.userId));
    const db = getAuthDb();
    const users = await db
      .collection("user")
      .find({ _id: { $in: userIds } }, { projection: { name: 1, email: 1 } })
      .toArray();

    const usersMap = new Map(users.map((u) => [u._id.toString(), u]));

    // Mapping logic
    const mapBooking = (b: any) => {
      const userData = usersMap.get(b.userId.toString());

      return {
        ...b,
        _id: b._id.toString(),

        // Admin specific fields
        consultationType: b.consultationType,
        zoomStartUrl: b.zoomStartUrl, // Changed from joinUrl to startUrl for Admin
        phoneNumber: b.phoneNumber,

        // Format Client/User Info
        user: userData
          ? {
              _id: userData._id.toString(),
              name: userData.name,
              email: userData.email,
            }
          : null,

        // Format Event Info
        event: b.eventId
          ? {
              _id: b.eventId._id.toString(),
              name: b.eventId.name,
              price: b.eventId.price,
            }
          : null,

        // Ensure dates are strings for the client components
        startTime: b.startTime?.toISOString(),
        endTime: b.endTime?.toISOString(),
        createdAt: b.createdAt?.toISOString(),
      };
    };

    return {
      upcoming: upcomingBookings.map(mapBooking),
      past: pastBookings.map(mapBooking),
      totalPages: Math.ceil(totalPastBookings / limit),
      totalPast: totalPastBookings,
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
