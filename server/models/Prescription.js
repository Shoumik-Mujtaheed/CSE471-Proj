import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    disease: {
      type: String,
      required: true,
      trim: true,
    },
    // UPDATED: More detailed medicine prescriptions
    prescribedMedicines: [{
      medicineId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Inventory', 
        required: true 
      },
      medicineName: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 }, // Price at time of prescription
      instructions: { type: String, trim: true }, // e.g., "Take twice daily"
      total: { type: Number, required: true, min: 0 } // quantity * price
    }],
    // ADDED: Total amount for the entire prescription
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // ADDED: Prescription status
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    // Keep your existing referral fields
    referredDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    referredDoctorName: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
