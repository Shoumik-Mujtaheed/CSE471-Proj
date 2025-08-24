import Invoice from '../models/Invoice.js';
import Inventory from '../models/Inventory.js';
import Prescription from '../models/Prescription.js';

// Generate unique invoice number
const generateInvoiceNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${timestamp}-${random}`;
};

// Auto-generate invoice from prescription
export const generateInvoiceForPrescription = async (prescriptionId) => {
  try {
    // Fetch the prescription with populated data
    const prescription = await Prescription.findById(prescriptionId)
      .populate('patient', 'name email phoneNumber')
      .populate('doctor', 'name email')
      .populate('prescribedMedicines.medicineId', 'name category quantity price');

    if (!prescription) {
      throw new Error('Prescription not found');
    }

    const invoiceItems = [];
    let subtotal = 0;

    // Process each prescribed medicine
    for (const med of prescription.prescribedMedicines) {
      const inventoryItem = await Inventory.findById(med.medicineId);
      
      let availability = 'unavailable';
      let availableQuantity = 0;
      
      if (inventoryItem) {
        availableQuantity = inventoryItem.quantity || inventoryItem.stock || 0;
        
        if (availableQuantity >= med.quantity) {
          availability = 'available';
        } else if (availableQuantity > 0) {
          availability = 'partial';
        }
      }

      invoiceItems.push({
        medicineId: med.medicineId,
        medicineName: med.medicineName,
        unitPrice: med.price,
        quantity: med.quantity,
        total: med.total,
        availability,
        availableQuantity
      });

      // Add to subtotal (already calculated in prescription)
      subtotal += med.total;
    }

    const tax = subtotal * 0.1; // 10% tax
    const totalAmount = subtotal + tax;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

    const invoice = new Invoice({
      invoiceNumber: generateInvoiceNumber(),
      patient: prescription.patient._id,
      prescription: prescription._id,
      items: invoiceItems,
      subtotal,
      tax,
      totalAmount,
      dueDate
    });

    await invoice.save();
    
    // Populate the invoice before returning
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('patient', 'name email phoneNumber')
      .populate('prescription', 'disease status');
    
    return populatedInvoice;
  } catch (err) {
    throw new Error(`Invoice generation failed: ${err.message}`);
  }
};

// Get all invoices
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('patient', 'name email phoneNumber')
      .populate({
        path: 'prescription',
        populate: {
          path: 'doctor',
          select: 'name email'
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
      .populate('patient', 'name email phoneNumber bloodGroup')
      .populate({
        path: 'prescription',
        populate: {
          path: 'doctor',
          select: 'name email'
        }
      })
      .populate('items.medicineId', 'name category');
    
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const validStatuses = ['pending', 'paid']; // Simplified
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const updateData = { status };
    
    // If marking as paid, add payment date
    if (status === 'paid') {
      updateData.paidDate = new Date();
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('patient', 'name email phoneNumber');
    
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({
      message: `Invoice status updated to ${status}`,
      invoice
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get invoices for a specific patient
export const getPatientInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ patient: req.params.patientId })
      .populate('patient', 'name email phoneNumber')
      .populate({
        path: 'prescription',
        populate: {
          path: 'doctor',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get invoices for a specific doctor (based on prescriptions they wrote)
export const getDoctorInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate({
        path: 'prescription',
        match: { doctor: req.params.doctorId },
        populate: {
          path: 'doctor',
          select: 'name email'
        }
      })
      .populate('patient', 'name email phoneNumber')
      .sort({ createdAt: -1 });

    // Filter out invoices where prescription is null (due to match condition)
    const filteredInvoices = invoices.filter(invoice => invoice.prescription !== null);
    
    res.json(filteredInvoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate invoice manually (admin function)
export const createManualInvoice = async (req, res) => {
  try {
    const { patientId, prescriptionId, items, notes } = req.body;

    if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: 'Patient ID and at least one item are required' 
      });
    }

    let subtotal = 0;
    const processedItems = [];

    // Process each item
    for (const item of items) {
      if (!item.medicineName || !item.quantity || !item.unitPrice) {
        return res.status(400).json({ 
          message: 'Each item must have medicineName, quantity, and unitPrice' 
        });
      }

      const itemTotal = item.quantity * item.unitPrice;
      
      // Check inventory if medicineId is provided
      let availability = 'available';
      let availableQuantity = 0;
      
      if (item.medicineId) {
        const inventoryItem = await Inventory.findById(item.medicineId);
        if (inventoryItem) {
          availableQuantity = inventoryItem.quantity || 0;
          if (availableQuantity < item.quantity) {
            availability = availableQuantity > 0 ? 'partial' : 'unavailable';
          }
        }
      }

      processedItems.push({
        medicineId: item.medicineId || null,
        medicineName: item.medicineName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: itemTotal,
        availability,
        availableQuantity
      });

      subtotal += itemTotal;
    }

    const tax = subtotal * 0.1; // 10% tax
    const totalAmount = subtotal + tax;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

    const invoice = new Invoice({
      invoiceNumber: generateInvoiceNumber(),
      patient: patientId,
      prescription: prescriptionId || null,
      items: processedItems,
      subtotal,
      tax,
      totalAmount,
      dueDate,
      notes: notes || ''
    });

    await invoice.save();

    // Populate and return the created invoice
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('patient', 'name email phoneNumber')
      .populate('prescription', 'disease status');

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: populatedInvoice
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update the getInvoiceStats function to work with simplified statuses

export const getInvoiceStats = async (req, res) => {
  try {
    const stats = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalInvoices = await Invoice.countDocuments();
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const pendingAmount = await Invoice.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      statusBreakdown: stats,
      totalInvoices,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingAmount: pendingAmount[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
