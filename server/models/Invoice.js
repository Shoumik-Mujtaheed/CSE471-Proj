import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    // ADDED: Unique invoice number for tracking
    invoiceNumber: { 
      type: String, 
      unique: true, 
      required: true 
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      required: true,
    },
    // UPDATED: More detailed items with inventory tracking
    items: [
      {
        medicineId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Inventory' 
        }, // Link to inventory for availability check
        medicineName: { type: String, required: true },
        unitPrice: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        total: { type: Number, required: true, min: 0 },
        // ADDED: Track availability at invoice generation
        availability: { 
          type: String, 
          enum: ['available', 'unavailable', 'partial'], 
          default: 'available' 
        },
        // ADDED: Available quantity at time of invoice
        availableQuantity: { type: Number, default: 0 }
      }
    ],
    // ADDED: Subtotal, tax, and better breakdown
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // UPDATED: More comprehensive status options
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'cancelled', 'partial'],
      default: 'pending',
    },
    // ADDED: Important dates for invoice management
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    // ADDED: Payment tracking
    paidDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

export default mongoose.model('Invoice', invoiceSchema);
