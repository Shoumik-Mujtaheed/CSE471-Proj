// models/Prescription.js
import mongoose from 'mongoose';

const prescriptionItemSchema = new mongoose.Schema({
  medication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  
  dosage: {
    type: String,
    required: true,
    trim: true // e.g., "1 tablet", "5ml"
  },
  
  frequency: {
    type: String,
    required: true,
    trim: true // e.g., "twice daily", "every 8 hours"
  },
  
  duration: {
    type: String,
    required: true,
    trim: true // e.g., "7 days", "until finished"
  },
  
  instructions: {
    type: String,
    trim: true,
    maxlength: 200 // e.g., "Take with food", "Avoid alcohol"
  },
  
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    prescriptionDate: {
      type: Date,
      default: Date.now
    },
    
    medications: [prescriptionItemSchema],
    
    diagnosis: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    
    symptoms: [{
      type: String,
      trim: true
    }],
    
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    },
    
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    
    followUpDate: {
      type: Date
    },
    
    isEmergency: {
      type: Boolean,
      default: false
    },
    
    totalCost: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for prescription duration in days
prescriptionSchema.virtual('durationInDays').get(function() {
  if (this.followUpDate && this.prescriptionDate) {
    const diffTime = this.followUpDate.getTime() - this.prescriptionDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Indexes for efficient queries
prescriptionSchema.index({ patient: 1, prescriptionDate: -1 });
prescriptionSchema.index({ doctor: 1, prescriptionDate: -1 });
prescriptionSchema.index({ status: 1, prescriptionDate: -1 });
prescriptionSchema.index({ prescriptionDate: 1 });

export default mongoose.model('Prescription', prescriptionSchema);
