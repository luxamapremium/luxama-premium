"use server";
import Stripe from "stripe";
import connectDB from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Event } from "@/lib/models/Event";
import mongoose from "mongoose";
import { createZoomMeeting } from "@/lib/zoom";
import { sendEmail } from "@/lib/email/sendEmail";
import client from "@/lib/db-client";
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

  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  // ─── FREE CONSULTATION PATH ───────────────────────────────
  if (event.isFree) {
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
    const booking = await Booking.create({
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

    const bookingId = booking._id.toString();

    try {
      const db = client.db("auth_db");

      const userDetails = await db
        .collection("user")
        .findOne(
          { _id: new ObjectId(effectiveUserId) },
          { projection: { name: 1, email: 1 } },
        );

      const adminDetails = await db
        .collection("user")
        .findOne(
          { _id: new ObjectId(adminId) },
          { projection: { name: 1, email: 1 } },
        );

      const typeLabel =
        consultationType === "video" ? "Video call" : "Phone call";

      // USER EMAIL
      if (userDetails?.email) {
        await sendEmail({
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
        });
      }

      // ADMIN EMAIL
      if (adminDetails?.email) {
        await sendEmail({
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
        });
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

  // ─── PAID CONSULTATION PATH (existing logic) ──────────────
  const booking = await Booking.create({
    eventId: new mongoose.Types.ObjectId(eventId),
    adminId: new mongoose.Types.ObjectId(adminId),
    userId: new mongoose.Types.ObjectId(effectiveUserId),
    startTime,
    endTime,
    consultationType,
    phoneNumber: consultationType === "phone" ? phoneNumber : undefined,

    status: "pending",
    paymentStatus: "unpaid",

    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
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

  booking.stripeSessionId = session.id;
  await booking.save();

  return { checkoutUrl: session.url };
}
