"use server";

import connectDB from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Event } from "@/lib/models/Event";
import { verifySuperAdmin } from "@/lib/auth/check-auth";
import { getAuthDb } from "@/lib/db-client";
import { ObjectId } from "mongodb";

export default async function fetchAllBookingsAdminsAction(
  page = 1,
  limit = 10,
) {
  try {
    await verifySuperAdmin();
    await connectDB();

    // Calculate how many documents to skip
    const skip = (page - 1) * limit;

    // 1. Get total count for frontend pagination controls
    const totalBookings = await Booking.countDocuments();
    const totalPages = Math.ceil(totalBookings / limit);

    // 2. Fetch only the specific slice of bookings
    const bookings = await Booking.find({})
      .populate({
        path: "eventId",
        select: "name price duration",
        model: Event,
      })
      .sort({ createdAt: -1 })
      .skip(skip) // Skip previous pages
      .limit(limit) // Only grab 10
      .lean();

    if (!bookings.length)
      return { bookings: [], totalPages, currentPage: page };

    // --- Keep your existing User/Admin mapping logic below ---
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

    const result = bookings.map((booking) => {
      const user = usersMap.get(booking.userId.toString());
      const admin = adminsMap.get(booking.adminId.toString());

      return {
        ...booking,
        user: user ? { name: user.name, email: user.email } : null,
        admin: admin ? { name: admin.name, email: admin.email } : null,
        event: booking.eventId ? { ...booking.eventId } : null,
      };
    });

    // Return both the data and the pagination metadata
    return {
      bookings: JSON.parse(JSON.stringify(result)), // Ensure plain objects for Next.js
      totalPages,
      currentPage: page,
      totalBookings,
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
