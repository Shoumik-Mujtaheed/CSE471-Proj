import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    // Patient
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Doctor
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true
    },

    // NEW: Concrete calendar date of the appointment (local midnight for that day)
    // Always set this when booking; do not rely on dayOfWeek alone.
    bookedDate: {
      type: Date,
      required: true,
      index: true
    },

    // Optional: store a precise clock time if you later move beyond coarse slots
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    },

    // Session window label (unchanged)
    timeSlot: {
      type: String,
      required: true,
      enum: ['8-12', '12-4', '4-8', '20-00']
    },

    // Optional, derived: 0-6 based on bookedDate. Kept for fast filtering and legacy UI.
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      index: true
    },

    // Reason/urgency
    reason: {
      type: String,
      required: true,
      trim: true
    },
    urgency: {
      type: String,
      enum: ['low', 'normal', 'high', 'emergency'],
      default: 'normal'
    },

    // Status lifecycle
    status: {
      type: String,
      enum: ['booked', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'booked',
      index: true
    },

    notes: {
      type: String,
      trim: true
    },

    // Clinical linkage
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    },

    followUpDate: {
      type: Date
    },
    followUpReason: {
      type: String,
      trim: true
    },

    // Billing
    consultationFee: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'waived'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'online']
    },

    // Insurance
    insuranceProvider: String,
    insurancePolicyNumber: String,
    insuranceCoverage: Number
  },
  { timestamps: true }
);

// Derived dayOfWeek from bookedDate, if not set
appointmentSchema.pre('save', function (next) {
  if (this.bookedDate && (this.dayOfWeek === undefined || this.dayOfWeek === null)) {
    const d = new Date(this.bookedDate);
    this.dayOfWeek = d.getDay();
  }
  next();
});

// Helpful compound indexes for common queries
appointmentSchema.index({ doctor: 1, bookedDate: 1, timeSlot: 1 }, { unique: true }); // prevent double-booking a slot/day
appointmentSchema.index({ user: 1, bookedDate: -1 });
appointmentSchema.index({ doctor: 1, status: 1, bookedDate: 1 });
appointmentSchema.index({ bookedDate: 1, timeSlot: 1 });

export default mongoose.model('Appointment', appointmentSchema);
