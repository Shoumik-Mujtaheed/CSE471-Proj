import mongoose from 'mongoose';

const statusEnum = ['pending', 'completed'];

const labTestOrderSchema = new mongoose.Schema(
  {
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
    status: {
      type: String,
      enum: statusEnum,
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('LabTestOrder', labTestOrderSchema);
