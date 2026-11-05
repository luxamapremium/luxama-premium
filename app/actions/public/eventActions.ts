"use server";

import connectDB from "@/lib/db";
import { Event } from "@/lib/models/Event";
import mongoose from "mongoose";
import { getAuthDb } from "@/lib/db-client";
import { ObjectId } from "mongodb";

// Get events by adminId
export async function getEventsByAdmin(adminId: string) {
  try {
    await connectDB();

    // Validate ObjectId
    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return {
        success: false,
        error: "Invalid admin ID",
        data: [],
      };
    }

    const events = await Event.find({
      isActive: true,
      adminId: new mongoose.Types.ObjectId(adminId),
    })
      .select("name description price isFree durationMinutes")
      .sort({ createdAt: -1 })
      .lean();

    const sanitizedEvents = events.map((event) => ({
      _id: event._id.toString(),
      name: event.name,
      description: event.description || null,
      price: event.price,
      isFree: event.isFree ?? event.price === 0,  
      durationMinutes: event.durationMinutes,
    }));

    return {
      success: true,
      data: sanitizedEvents,
    };
  } catch (error) {
    console.error(
      "Error fetching events:",
      (error as Error)?.name,
      (error as Error)?.message,
    );
    return {
      success: false,
      error: "Failed to fetch events",
      data: [],
    };
  }
}

// Get a single event by id (with host role from auth_db)
export async function getEventById(eventId: string) {
  try {
    await connectDB();

    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return {
        success: false,
        error: "Invalid event ID",
        data: null,
      };
    }

    // 1. Fetch the event using Mongoose
    const event = await Event.findOne({
      _id: new mongoose.Types.ObjectId(eventId),
      isActive: true,
    })
      .select("name description price isFree durationMinutes adminId")
      .lean();

    if (!event) {
      return {
        success: false,
        error: "Event not found",
        data: null,
      };
    }

    // 2. Query auth_db using the native client for the host's role
    const db = getAuthDb();
    const adminUser = await db
      .collection("user")
      .findOne(
        { _id: new ObjectId(event.adminId.toString()) },
        { projection: { role: 1 } },
      );

    // 3. Sanitize and include the hostRole
    const sanitizedEvent = {
      _id: event._id.toString(),
      adminId: event.adminId.toString(),
      name: event.name,
      description: event.description || null,
      price: event.price,
      isFree: event.isFree ?? event.price === 0,
      durationMinutes: event.durationMinutes,
      // Provide hostRole so the frontend can toggle Video Call
      hostRole: adminUser?.role || "user",
    };

    return {
      success: true,
      data: sanitizedEvent,
    };
  } catch (error) {
    console.error(
      "Error fetching event details:",
      (error as Error)?.name,
      (error as Error)?.message,
    );
    return {
      success: false,
      error: "Failed to fetch event",
      data: null,
    };
  }
}
