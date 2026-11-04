import mongoose, { Schema, Document } from "mongoose";
import "./Event";

export interface IBooking extends Document {
  eventId: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: "pending" | "confirmed" | "expired" | "conflict" | "cancelled";
  consultationType: "phone" | "video";
  phoneNumber?: string;
  zoomJoinUrl?: string;
  zoomStartUrl?: string;
  paymentStatus: "unpaid" | "paid" | "free";
  paymentIntentId?: string;
  stripeSessionId?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "expired", "conflict", "cancelled"],
      default: "pending",
    },
    consultationType: {
      type: String,
      enum: ["phone", "video"],
      required: true,
    },
    phoneNumber: { type: String },
    zoomJoinUrl: { type: String },
    zoomStartUrl: { type: String },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "free"],
      default: "unpaid",
    },
    paymentIntentId: { type: String },
    stripeSessionId: { type: String },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// expire after 30 minutes
BookingSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 1800,
    partialFilterExpression: { status: "pending" },
  },
);

// Optimize availability queries filtering by adminId, startTime range, and status
BookingSchema.index(
  { adminId: 1, startTime: 1, status: 1 },
  { name: "booking_availability_idx" },
);

// Prevent double-booking for active holds (pending) and confirmed consultations
BookingSchema.index(
  { adminId: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["confirmed", "pending"] } },
    name: "unique_confirmed_slot_per_admin",
  },
);

export const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
