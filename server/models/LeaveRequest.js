// models/LeaveRequest.js
import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
  {
    // Reference to either Doctor or Staff
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'requesterType'
    },
    requesterType: {
      type: String,
      required: true,
      enum: ['Doctor', 'Staff']
    },
    
    // Leave details
    leaveType: {
      type: String,
      required: true,
      enum: [
        'sick_leave',
        'vacation',
        'personal_leave', 
        'emergency_leave',
        'maternity_leave',
        'paternity_leave',
        'bereavement_leave',
        'other'
      ]
    },
    
    startDate: {
      type: Date,
      required: true
    },
    
    endDate: {
      type: Date,
      required: true
    },
    
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    
    // Admin response
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    
    adminComment: {
      type: String,
      trim: true,
      maxlength: 300
    },
    
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    
    // Additional metadata
    totalDays: {
      type: Number,
      required: false
    },
    
    isEmergency: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual to populate requester details
leaveRequestSchema.virtual('requesterDetails', {
  ref: function() {
    return this.requesterType;
  },
  localField: 'requester',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to calculate total days
leaveRequestSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    this.totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
  }
  next();
});

// Index for efficient queries
leaveRequestSchema.index({ requester: 1, requesterType: 1, status: 1 });
leaveRequestSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model('LeaveRequest', leaveRequestSchema);
