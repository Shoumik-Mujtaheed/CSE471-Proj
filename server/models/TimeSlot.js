// models/TimeSlot.js
import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // "14:00"
    endTime: { type: String, required: true },   // "15:00"
    status: {
      type: String,
      enum: ['available', 'booked', 'unavailable', 'requested'], // + requested
      default: 'available',
    },
  },
  { timestamps: true }
);

export default mongoose.model('TimeSlot', timeSlotSchema);
