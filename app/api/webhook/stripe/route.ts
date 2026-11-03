import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectDB from "@/lib/db";
import { getAuthDb } from "@/lib/db-client";
import { Booking } from "@/lib/models/Booking";
import { ObjectId } from "mongodb";
import { sendEmail } from "@/lib/email/sendEmail";
import { createZoomMeeting } from "@/lib/zoom";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (!bookingId)
      return NextResponse.json({ error: "No bookingId" }, { status: 400 });

    await connectDB();

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // Prevent double-processing
    if (booking.paymentStatus === "paid")
      return NextResponse.json({ received: true });

    // Create Zoom meeting if video
    let zoomJoinUrl: string | null = null;
    let zoomStartUrl: string | null = null;

    if (booking.consultationType === "video") {
      const zoomData = await createZoomMeeting(
        `Consultation Booking #${bookingId.toString().slice(-8)}`,
        booking.startTime,
        30, // duration in minutes (can fetch from Event)
      );
      zoomJoinUrl = zoomData.joinUrl;
      zoomStartUrl = zoomData.startUrl;
    }

    // Update booking
    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    booking.paymentIntentId = session.payment_intent as string;
    booking.zoomJoinUrl = zoomJoinUrl;
    booking.zoomStartUrl = zoomStartUrl;

    try {
      await booking.save();
    } catch (saveError: any) {
      if (saveError?.code === 11000) {
        console.error("Duplicate confirmed booking detected in Stripe webhook (E11000):", {
          bookingId,
          adminId: booking.adminId,
          startTime: booking.startTime,
        });
        booking.status = "conflict";
        booking.paymentStatus = "paid";
        await booking.save();
        return NextResponse.json({
          received: true,
          status: "conflict",
          message: "Double booking detected; flagged for admin resolution",
        });
      }
      throw saveError;
    }

    try {
      const db = getAuthDb();

      const userDetails = await db
        .collection("user")
        .findOne(
          { _id: new ObjectId(booking.userId) },
          { projection: { name: 1, email: 1 } },
        );

      const adminDetails = await db
        .collection("user")
        .findOne(
          { _id: new ObjectId(booking.adminId) },
          { projection: { name: 1, email: 1 } },
        );

      const amount = (session.amount_total! / 100).toFixed(2);
      const currency = session.currency?.toUpperCase();

      // USER EMAIL
      if (userDetails?.email) {
        await sendEmail({
          to: userDetails.email,
          subject: "Booking Confirmed! | KS Global Services",
          html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px; text-transform: uppercase;">Booking Confirmed</h1>
              </div>
              <div style="padding: 40px 30px;">
                <h2 style="color: #111827; font-size: 20px; margin-bottom: 16px;">Hello ${userDetails.name},</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Your payment was successful. Your professional consultation is now scheduled and confirmed.
                </p>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px; font-weight: bold; text-transform: uppercase;">Consultation Details</p>
                  <p style="margin: 5px 0; font-size: 16px; color: #1e293b;"><strong>Booking ID:</strong> <span style="color: #2563eb;">#${bookingId.toString().slice(-8)}</span></p>
                  <p style="margin: 5px 0; font-size: 16px; color: #1e293b;"><strong>Amount Paid:</strong> ${amount} ${currency}</p>
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
          </div>
          `,
        });
      }

      // ✅ ADMIN EMAIL
      if (adminDetails?.email) {
        await sendEmail({
          to: adminDetails.email,
          subject: "New Booking | KS Global Services",
          html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff; padding: 40px 20px; border-top: 4px solid #1e293b;">
            <div style="max-width: 600px; margin: 0 auto;">
              <span style="color: #2563eb; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Admin Notification</span>
              <h2 style="color: #111827; font-size: 28px; margin-top: 8px;">New Booking</h2>
              <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />

              <div style="margin-bottom: 30px;">
                <p style="font-size: 16px; color: #374151;">A new consultation has been booked.</p>

                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Customer</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: bold; text-align: right;">${userDetails?.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Email</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; text-align: right;">${userDetails?.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Revenue</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #059669; font-weight: bold; text-align: right;">+${amount} ${currency}</td>
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
            </div>
          </div>
          `,
        });
      }
    } catch (err) {
      console.error("Post-payment notification failed:", err);
    }
  }

  return NextResponse.json({ received: true });
}
