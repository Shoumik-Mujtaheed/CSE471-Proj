import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema(
  {
    startTime: {
      type: String, // "09:00"
      required: true
    },
    endTime: {
      type: String, // "17:00"
      required: true
    },
    days: {
      type: [String], // ["Monday", "Wednesday"], etc.
      enum: [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday"
      ],
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
      unique: true // One to one: each staff profile matches one User
    },
    shifts: [shiftSchema] // Array: in case staff member has multiple scheduled shifts
  },
  { timestamps: true }
);

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
