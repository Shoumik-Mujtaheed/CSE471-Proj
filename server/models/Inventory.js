import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Optional: If you wish to control stock quantities
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    // NEW: Reorder threshold for alerts
    reorderThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    // NEW: Reorder quantity (how much to order when low)
    reorderQuantity: {
      type: Number,
      default: 50,
      min: 1,
    },
    // NEW: Supplier information
    supplier: {
      type: String,
      default: 'Default Supplier',
    },
    // NEW: Last reorder date
    lastReorderDate: {
      type: Date,
      default: null,
    },
    // NEW: Status for reorder alerts
    needsReorder: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

// NEW: Virtual field to check if stock is low
medicineSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.reorderThreshold;
});

// NEW: Pre-save middleware to update needsReorder status
medicineSchema.pre('save', function(next) {
  this.needsReorder = this.quantity <= this.reorderThreshold;
  next();
});

export default mongoose.model('Inventory', medicineSchema);
