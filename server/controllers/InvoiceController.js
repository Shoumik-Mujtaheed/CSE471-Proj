import Invoice from '../models/Invoice.js';
import Inventory from '../models/Inventory.js';

// Generate unique invoice number
const generateInvoiceNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${timestamp}-${random}`;
};

// Auto-generate invoice from prescription
export const generateInvoiceForPrescription = async (prescription) => {
  try {
    const invoiceItems = [];
    let subtotal = 0;

    // Process each medicine and check availability
    for (const med of prescription.prescribedMedicines) {
      const inventoryItem = await Inventory.findById(med.medicineId);
      
      let availability = 'unavailable';
      let availableQuantity = 0;
      
      if (inventoryItem) {
        availableQuantity = inventoryItem.quantity;
        if (inventoryItem.quantity >= med.quantity) {
          availability = 'available';
        } else if (inventoryItem.quantity > 0) {
          availability = 'partial';
        }
      }

      const itemTotal = med.price * med.quantity;
      invoiceItems.push({
        medicineId: med.medicineId,
        medicineName: med.medicineName,
        unitPrice: med.price,
        quantity: med.quantity,
        total: itemTotal,
        availability,
        availableQuantity
      });

      // Only add to subtotal if medicine is available (full or partial)
      if (availability !== 'unavailable') {
        subtotal += itemTotal;
      }
    }

    const tax = subtotal * 0.1; // 10% tax
    const totalAmount = subtotal + tax;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

    const invoice = new Invoice({
      invoiceNumber: generateInvoiceNumber(),
      patient: prescription.patient,
      prescription: prescription._id,
      items: invoiceItems,
      subtotal,
      tax,
      totalAmount,
      dueDate
    });

    await invoice.save();
    return invoice;
  } catch (err) {
    throw new Error(`Invoice generation failed: ${err.message}`);
  }
};

// Get all invoices
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('patient', 'name email phoneNumber')
      .populate('prescription', 'disease doctor')
      .populate({
        path: 'prescription',
        populate: {
          path: 'doctor',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient')
      .populate({
        path: 'prescription',
        populate: {
          path: 'doctor',
          select: 'name'
        }
      });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update invoice status
export const updateInvoiceStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const updateData = { status };
    
    // If marking as paid, add payment date
    if (status === 'paid') {
      updateData.paidDate = new Date();
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
