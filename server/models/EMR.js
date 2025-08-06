import mongoose from 'mongoose';

const externalPrescriptionSchema = new mongoose.Schema(
  {
    disease: {
      type: String,
      required: true,
      trim: true,
    },
    prescribedMedicines: {
      type: String,
      required: true,
      trim: true,
    },
    documentUrl: {
      type: String, // Link or path to uploaded file (pdf/jpg, etc.)
      required: false,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    }
  },
  { _id: false }
);

const emrSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One EMR per patient
    },
    appointments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment"
    }],
    prescriptions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription"
    }],
    labTests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabTestOrder"
    }],
    labResults: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabTestResult"
    }],
    invoices: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice"
    }],
    externalPrescriptions: [externalPrescriptionSchema] // Patient-uploaded past medical docs
  },
  { timestamps: true }
);

const EMR = mongoose.model("EMR", emrSchema);

export default EMR;
