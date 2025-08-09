import mongoose from 'mongoose';

const labTestResultSchema = new mongoose.Schema(
  {
    labTestOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTestOrder',
      required: true,
    },
    labTestName: {
      type: String,
      required: true,
      trim: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    result: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('LabTestResult', labTestResultSchema);
