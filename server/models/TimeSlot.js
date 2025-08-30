import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number,
    enum: [0, 1, 2, 3, 4, 5, 6], // 0=Sunday, 1=Monday, 2=Tuesday, etc.
    required: true
  },
  timeSlot: {
    type: String,
    enum: ['8-12', '12-4', '4-8', '20-00'],
    required: true
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'PENDING', 'ASSIGNED', 'UNAVAILABLE', 'BOOKED'],
    default: 'AVAILABLE'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  // Track if this slot has an active appointment
  hasAppointment: {
    type: Boolean,
    default: false
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  }
}, {
  timestamps: true
});

// Unique index: one slot per day per time
timeSlotSchema.index({ dayOfWeek: 1, timeSlot: 1 }, { unique: true });

// Helper method to check if slot is available for booking
timeSlotSchema.methods.isAvailableForBooking = function() {
  return this.status === 'ASSIGNED' && !this.hasAppointment;
};

// Helper method to check if slot can be assigned to doctor
timeSlotSchema.methods.canBeAssigned = function() {
  return this.status === 'AVAILABLE';
};

export default mongoose.model('TimeSlot', timeSlotSchema);
