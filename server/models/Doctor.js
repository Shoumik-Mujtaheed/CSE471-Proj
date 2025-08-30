import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    // Array to store approved time slots for this doctor
    appointmentTimes: [{
      dayOfWeek: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5, 6], // 0=Sunday, 1=Monday, etc.
        required: true
      },
      timeSlot: {
        type: String,
        enum: ['8-12', '12-4', '4-8', '20-00'],
        required: true
      },
      timeSlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeSlot',
        required: true
      },
      approvedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  { timestamps: true }
);

export default mongoose.model('Doctor', doctorSchema);
