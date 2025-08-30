import mongoose from 'mongoose';

const doctorScheduleSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  dayOfWeek: [{
    type: Number,
    enum: [0, 1, 2, 3, 4, 5, 6], // 0=Sunday, 1=Monday, 2=Tuesday, etc.
    required: true
  }],
  timeSlot: {
    type: String,
    enum: ['8-12', '12-4', '4-8', '20-00'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'INACTIVE'],
    default: 'PENDING'
  },
  notes: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure one schedule per doctor per time slot
doctorScheduleSchema.index({ doctor: 1, timeSlot: 1 }, { unique: true });

// Helper method to check if a specific day is available
doctorScheduleSchema.methods.isDayAvailable = function(dayOfWeek) {
  return this.status === 'APPROVED' && this.dayOfWeek.includes(dayOfWeek);
};

export default mongoose.model('DoctorSchedule', doctorScheduleSchema);









