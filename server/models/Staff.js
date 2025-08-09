// models/Staff.js
import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true }, // "09:00"
    endTime:   { type: String, required: true }, // "17:00"
    days: {
      type: [String],
      enum: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      required: true
    }
  },
  { _id: false }
);

const staffSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    department: {
      type: String,
      trim: true,
    },
    shifts: [shiftSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Staff", staffSchema);
