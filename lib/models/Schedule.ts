import mongoose, { Schema, Document } from "mongoose";
import { DAYS_OF_WEEK } from "../constants/days_of_week";

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export interface ITimeSlot {
  _id?: mongoose.Types.ObjectId;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
}

export interface ISchedule extends Document {
  adminId: mongoose.Types.ObjectId;
  dayOfWeek: DayOfWeek;
  timeSlots: ITimeSlot[];
}

const TimeSlotSchema = new Schema<ITimeSlot>({
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  isEnabled: { type: Boolean, default: true },
});

const ScheduleSchema = new Schema<ISchedule>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dayOfWeek: {
      type: String,
      enum: DAYS_OF_WEEK,
      required: true,
    },
    timeSlots: {
      type: [TimeSlotSchema],
      default: [],
    },
  },
  { timestamps: true },
);

ScheduleSchema.index({ adminId: 1, dayOfWeek: 1 }, { unique: true });

export const Schedule =
  mongoose.models.Schedule ||
  mongoose.model<ISchedule>("Schedule", ScheduleSchema);
