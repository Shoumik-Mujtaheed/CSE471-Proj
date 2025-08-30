import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    user: { // Patient
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: { // Doctor
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: { // Specific appointment date
      type: Date,
      required: true,
    },
    dayOfWeek: { // Day of week (0-6, 0=Sunday)
      type: Number,
      required: true,
      min: 0,
      max: 6
    },
    timeSlot: { // Time slot (e.g., "8-12", "12-4")
      type: String,
      required: true,
      enum: ['8-12', '12-4', '4-8', '20-00']
    },
    reason: { // Reason for visit
      type: String,
      required: true,
      trim: true,
    },
    urgency: { // Urgency level
      type: String,
      enum: ['low', 'normal', 'high', 'emergency'],
      default: 'normal',
    },
    status: { // Appointment status
      type: String,
      enum: ['booked', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'booked',
    },
    notes: { // Additional notes
      type: String,
      trim: true,
    },
    prescription: { // Reference to prescription if created
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },
    followUpDate: { // Follow-up appointment date
      type: Date,
    },
    followUpReason: { // Reason for follow-up
      type: String,
      trim: true,
    },
    // Payment and billing
    consultationFee: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'waived'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'online'],
    },
    // Insurance
    insuranceProvider: String,
    insurancePolicyNumber: String,
    insuranceCoverage: Number,
    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
appointmentSchema.index({ user: 1, date: 1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ status: 1, date: 1 });
appointmentSchema.index({ date: 1, timeSlot: 1 });
appointmentSchema.index({ doctor: 1, dayOfWeek: 1, timeSlot: 1 });

// Pre-save middleware to update updatedAt
appointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Appointment', appointmentSchema);
