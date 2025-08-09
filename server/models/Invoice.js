import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
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
    items: [
      {
        medicineName: { type: String, required: true },
        price:        { type: Number, required: true, min: 0 },
        quantity:     { type: Number, default: 1, min: 1 },
        total:        { type: Number, required: true, min: 0 }
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    }
  },
  { timestamps: true }
);

export default mongoose.model('Invoice', invoiceSchema);
