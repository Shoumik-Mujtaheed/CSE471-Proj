import mongoose from 'mongoose';

const doctorReferralSchema = new mongoose.Schema(
  {
    originalDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // or 'Doctor' if you have a separate model—most likely 'User'
      required: true,
    },
    referredDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('DoctorReferral', doctorReferralSchema);
