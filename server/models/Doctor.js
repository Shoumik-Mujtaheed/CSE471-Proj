import mongoose from 'mongoose';

// Days of week for appointment settings (could use number 0-6 or string)
const daysOfWeekEnum = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday"
];

const appointmentTimeSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: daysOfWeekEnum,
      required: true
    },
    startTime: {
      type: String, // e.g., "19:00"
      required: true
    },
    endTime: {
      type: String, // e.g., "22:00"
      required: true
    }
  },
  { _id: false } // prevents creation of an unnecessary _id on subdocuments
);

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true // One-to-one with User
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    appointmentTimes: [appointmentTimeSchema], // Array of available slots
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
