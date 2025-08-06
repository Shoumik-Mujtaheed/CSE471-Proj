import mongoose from 'mongoose';

const statusEnum = ['booked', 'completed', 'cancelled', 'treated'];

const appointmentSchema = new mongoose.Schema(
  {
    user: { // Patient's User ID
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: { // Doctor's User ID or Doctor model ID (here using Doctor model)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: statusEnum,
      default: 'booked',
    },
    prescription: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
