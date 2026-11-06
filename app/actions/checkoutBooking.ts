"use server";
import Stripe from "stripe";
import connectDB from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Event } from "@/lib/models/Event";
import mongoose from "mongoose";
import { createZoomMeeting } from "@/lib/zoom";
import { sendEmail } from "@/lib/email/sendEmail";
import { getAuthDb } from "@/lib/db-client";
import { ObjectId } from "mongodb";
import { verifyUser } from "@/lib/auth/check-auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createBookingCheckout({
  eventId,
  adminId,
  userId,
  startTime,
  endTime,
  consultationType,
  phoneNumber,
}: {
  eventId: string;
  adminId: string;
  userId?: string;
  startTime: Date;
  endTime: Date;
  consultationType: "phone" | "video";
  phoneNumber?: string;
}) {
  await connectDB();
  const sessionUser = await verifyUser();
  const effectiveUserId = sessionUser.id;

  const event = await Event.findById(eventId)
    .select("isFree durationMinutes price name")
    .lean();
  if (!event) throw new Error("Event not found");

  const adminObjectId = new mongoose.Types.ObjectId(adminId);
  const slotStartTime = new Date(startTime);

  // 1. Release expired pending holds for this slot so they don't block availability or unique index
  const now = new Date();
  await Booking.updateMany(
    {
      adminId: adminObjectId,
      startTime: slotStartTime,
      status: "pending",
      expiresAt: { $lte: now },
    },
    { $set: { status: "expired" } },
  );

  // 2. Concurrency check: check if slot is actively booked or held
  const activeBooking = await Booking.findOne({
    adminId: adminObjectId,
    startTime: slotStartTime,
    $or: [
      { status: "confirmed" },
      { status: "pending", expiresAt: { $gt: now } },
    ],
  });

  if (activeBooking) {
    if (activeBooking.status === "confirmed") {
      throw new Error("This time slot is already booked or reserved.");
    }
    // If pending hold belongs to another user, block checkout
    if (activeBooking.userId.toString() !== effectiveUserId) {
      throw new Error("This time slot was just taken, please choose another one.");
    }
  }

  // ─── FREE CONSULTATION PATH ───────────────────────────────
  if (event.isFree) {
    // If current user previously had a pending hold for this slot, remove it before confirming
    await Booking.deleteMany({
      adminId: adminObjectId,
      startTime: slotStartTime,
      userId: new mongoose.Types.ObjectId(effectiveUserId),
      status: "pending",
    });

    // Create Zoom meeting if video consultation
    let zoomJoinUrl: string | null = null;
    let zoomStartUrl: string | null = null;

    if (consultationType === "video") {
      const zoomData = await createZoomMeeting(
        `Consultation Booking (Free)`,
        startTime,
        event.durationMinutes,
      );
      zoomJoinUrl = zoomData.joinUrl;
      zoomStartUrl = zoomData.startUrl;
    }

    // Create booking as immediately confirmed — no Stripe, no expiry
    let booking;
    try {
      booking = await Booking.create({
        eventId: new mongoose.Types.ObjectId(eventId),
        adminId: new mongoose.Types.ObjectId(adminId),
        userId: new mongoose.Types.ObjectId(effectiveUserId),
        startTime,
        endTime,
        consultationType,
        phoneNumber: consultationType === "phone" ? phoneNumber : undefined,
        status: "confirmed",
        paymentStatus: "free",
        zoomJoinUrl,
        zoomStartUrl,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new Error("This time slot was just taken, please choose another one.");
      }
      throw err;
    }

    const bookingId = booking._id.toString();

    try {
      const db = getAuthDb();

      const [userDetails, adminDetails] = await Promise.all([
        db
          .collection("user")
          .findOne(
            { _id: new ObjectId(effectiveUserId) },
            { projection: { name: 1, email: 1 } },
          ),
        db
          .collection("user")
          .findOne(
            { _id: new ObjectId(adminId) },
            { projection: { name: 1, email: 1 } },
          ),
      ]);

      const typeLabel =
        consultationType === "video" ? "Video call" : "Phone call";

      const emailTasks: Promise<unknown>[] = [];

      // USER EMAIL
      if (userDetails?.email) {
        emailTasks.push(
          sendEmail({
            to: userDetails.email,
            subject: "Booking Confirmed! | KS Global Services",
            html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; text-transform: uppercase;">Booking Confirmed</h1>
              </div>
              <div style="padding: 40px 30px;">
                <h2 style="color: #111827; font-size: 20px; margin-bottom: 16px;">Hello ${userDetails.name},</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Your free consultation is now scheduled and confirmed, Please go to your dashboard for more details.
                </p>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px; font-weight: bold; text-transform: uppercase;">Consultation Details</p>
                  <p style="margin: 5px 0; font-size: 16px; color: #1e293b;"><strong>Booking ID:</strong> <span style="color: #2563eb;">#${bookingId.slice(-8)}</span></p>
                  <p style="margin: 5px 0; font-size: 16px; color: #1e293b;"><strong>Type:</strong> ${typeLabel}</p>
                  ${
                    zoomJoinUrl
                      ? `<p style="margin: 10px 0; font-size: 16px; color: #1e293b;"><strong>Join Link:</strong> <a href="${zoomJoinUrl}" style="color: #2563eb;">Click to Join</a></p>`
                      : ""
                  }
                </div>
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 32px;">
                  Thank you for choosing KS Global Services.
                </p>
              </div>
            </div>
          </div>`,
          }),
        );
      }

      // ADMIN EMAIL
      if (adminDetails?.email) {
        emailTasks.push(
          sendEmail({
            to: adminDetails.email,
            subject: "New Free Consultation | KS Global Services",
            html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff; padding: 40px 20px; border-top: 4px solid #1e293b;">
            <div style="max-width: 600px; margin: 0 auto;">
              <span style="color: #2563eb; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Admin Notification</span>
              <h2 style="color: #111827; font-size: 28px; margin-top: 8px;">New Free Consultation</h2>
              <h4 style="color: #111827; font-size: 14px; margin-top: 6px;">Please go to your dashboard for more details</h4>
              <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Customer</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: bold; text-align: right;">${userDetails?.name ?? "Unknown"}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Email</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; text-align: right;">${userDetails?.email ?? "Unknown"}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Type</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; text-align: right;">${typeLabel}</td>
                </tr>
                ${
                  consultationType === "phone" && phoneNumber
                    ? `<tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Phone</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; text-align: right;">${phoneNumber}</td>
                      </tr>`
                    : ""
                }
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Price</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #059669; font-weight: bold; text-align: right;">Free</td>
                </tr>
                ${
                  zoomStartUrl
                    ? `<tr>
                        <td style="padding: 12px 0; color: #6b7280;">Start Meeting</td>
                        <td style="padding: 12px 0; color: #111827; font-weight: bold; text-align: right;"><a href="${zoomStartUrl}" style="color: #2563eb;">Click to Start</a></td>
                      </tr>`
                    : ""
                }
              </table>
            </div>
          </div>`,
          }),
        );
      }

      if (emailTasks.length > 0) {
        await Promise.all(emailTasks);
      }
    } catch (err) {
      console.error("Free booking notification failed:", err);
    }

    return {
      checkoutUrl: null,
      bookingId: booking._id.toString(),
      isFree: true,
    };
  }

  // ─── PAID CONSULTATION PATH ──────────────────────────────
  // Pending hold duration: 31 minutes (aligns with Stripe checkout minimum 30 minutes with buffer)
  const HOLD_DURATION_MS = 31 * 60 * 1000;
  const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MS);

  let booking: any;

  // Same user retrying: if the same user already has an active hold for this slot, resume/replace it
  if (
    activeBooking &&
    activeBooking.status === "pending" &&
    activeBooking.userId.toString() === effectiveUserId
  ) {
    activeBooking.eventId = new mongoose.Types.ObjectId(eventId);
    activeBooking.consultationType = consultationType;
    activeBooking.phoneNumber =
      consultationType === "phone" ? phoneNumber : undefined;
    activeBooking.expiresAt = holdExpiresAt;
    activeBooking.paymentStatus = "unpaid";
    await activeBooking.save();
    booking = activeBooking;
  } else {
    // Atomically create the pending hold (enforced by DB unique index on adminId + startTime)
    try {
      booking = await Booking.create({
        eventId: new mongoose.Types.ObjectId(eventId),
        adminId: new mongoose.Types.ObjectId(adminId),
        userId: new mongoose.Types.ObjectId(effectiveUserId),
        startTime,
        endTime,
        consultationType,
        phoneNumber: consultationType === "phone" ? phoneNumber : undefined,
        status: "pending",
        paymentStatus: "unpaid",
        expiresAt: holdExpiresAt,
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new Error(
          "This time slot was just taken, please choose another one.",
        );
      }
      throw err;
    }
  }

  // Create Stripe Checkout Session expiring at the hold expiry (minimum 30 minutes in the future)
  const stripeExpiresAt = Math.floor(holdExpiresAt.getTime() / 1000);
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      expires_at: stripeExpiresAt,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: event.price * 100,
            product_data: { name: event.name },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?id=${booking._id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancel`,
      metadata: {
        bookingId: booking._id.toString(),
      },
    });
  } catch (stripeError) {
    // If Stripe creation fails, release hold immediately so slot is not blocked
    await Booking.findByIdAndDelete(booking._id);
    throw stripeError;
  }

  booking.stripeSessionId = session.id;
  await booking.save();

  return { checkoutUrl: session.url };
}
