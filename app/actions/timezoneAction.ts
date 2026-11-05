"use server";

import Timezone from "@/lib/models/Timezone";
import connectDB from "@/lib/db";
import { verifyAdmin } from "@/lib/auth/check-auth";

// ADMIN ONLY
export async function setAdminTimezone(timezone: string) {
  await connectDB();

  const user = await verifyAdmin();
  const adminId = user.id;

  const config = await Timezone.findOneAndUpdate(
    { adminId },
    { timezone },
    { new: true, upsert: true, runValidators: true },
  );

  return {
    success: true,
    data: JSON.parse(JSON.stringify(config)),
  };
}

// 2. Update your existing getAdminTimezone (for the Admin Settings page)
export async function getAdminTimezone() {
  await connectDB();
  const user = await verifyAdmin(); // This stays for the Admin Dashboard
  return getAdminTimezoneById(user.id);
}

// PUBLIC (no verifyAdmin)
export async function getAdminTimezoneById(adminId: string) {
  await connectDB();

  const config = await Timezone.findOne({ adminId });

  if (!config) {
    return "UTC"; // safe fallback
  }

  return config.timezone;
}
