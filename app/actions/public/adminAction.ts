"use server";

import { getAuthDb } from "@/lib/db-client";
import { ObjectId } from "mongodb";

// Helper to define allowed roles
const ADMIN_ROLES = ["admin", "super-admin"];

/**
 * Fetches all users with the role 'admin' or 'super-admin'
 */
export async function getAdmins() {
  try {
    const db = getAuthDb();

    const admins = await db
      .collection("user")
      .find(
        { role: { $in: ADMIN_ROLES } },
        { projection: { name: 1, image: 1, role: 1 } },
      )
      .toArray();

    const serializedAdmins = admins.map((admin) => ({
      ...admin,
      _id: admin._id.toString(),
    }));

    return {
      success: true,
      data: serializedAdmins,
    };
  } catch (error) {
    console.error("Database Error (getAdmins):", error);
    return {
      success: false,
      error: "Failed to fetch admins.",
    };
  }
}

/**
 * Fetches a single admin/super-admin by their ID string.
 */
export async function getAdminById(adminId: string) {
  try {
    if (!ObjectId.isValid(adminId)) {
      return { success: false, error: "Invalid Admin ID format." };
    }

    const db = getAuthDb();

    const admin = await db.collection("user").findOne(
      {
        _id: new ObjectId(adminId),
        role: { $in: ADMIN_ROLES }, // Ensure the ID requested belongs to an admin
      },
      { projection: { name: 1, image: 1, role: 1 } },
    );

    if (!admin) {
      return { success: false, error: "Admin not found." };
    }

    const serializedAdmin = {
      ...admin,
      _id: admin._id.toString(),
    };

    return {
      success: true,
      data: serializedAdmin,
    };
  } catch (error) {
    console.error("Database Error (getAdminById):", error);
    return {
      success: false,
      error: "An unexpected error occurred.",
    };
  }
}
