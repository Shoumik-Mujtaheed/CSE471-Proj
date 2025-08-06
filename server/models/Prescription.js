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
      ref: "User", // The doctor who wrote the prescription
      required: true,
    },
    disease: {
      type: String,
      required: true,
      trim: true,
    },
    prescribedMedicines: {
      type: [String], 
      required: true,
      trim: true,
    },
    // Only include referredDoctor if there's a referral
    referredDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The doctor to whom the patient is referred, if any
    },
    referredDoctorName: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
