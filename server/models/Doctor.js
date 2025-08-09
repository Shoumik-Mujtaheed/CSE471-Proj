// models/Doctor.js
import mongoose from 'mongoose';

const daysOfWeekEnum = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday"
];

const appointmentTimeSchema = new mongoose.Schema(
  {
    dayOfWeek: { type: String, enum: daysOfWeekEnum, required: true },
    startTime: { type: String, required: true }, // "09:00"
    endTime:   { type: String, required: true }  // "17:00"
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    appointmentTimes: [appointmentTimeSchema],
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
