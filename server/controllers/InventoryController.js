import Inventory from '../models/Inventory.js';
import csv from 'csvtojson';

// ================= BASICS =================

// Get all medicines
export const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Inventory.find();
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new medicine
export const addMedicine = async (req, res) => {
  const { name, price, quantity, reorderThreshold, reorderQuantity, supplier } = req.body;
  try {
    const exists = await Inventory.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Medicine already exists.' });
    
    const medicine = new Inventory({ 
      name, 
      price, 
      quantity: quantity || 0,
      reorderThreshold: reorderThreshold || 10,
      reorderQuantity: reorderQuantity || 50,
      supplier: supplier || 'Default Supplier'
    });
    await medicine.save();
    res.status(201).json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update medicine
export const updateMedicine = async (req, res) => {
  const { id } = req.params;
  const { name, price, quantity, reorderThreshold, reorderQuantity, supplier } = req.body;
  try {
    const medicine = await Inventory.findByIdAndUpdate(
      id,
      { name, price, quantity, reorderThreshold, reorderQuantity, supplier },
      { new: true }
    );
    if (!medicine) return res.status(404).json({ message: 'Medicine not found.' });
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete medicine
export const deleteMedicine = async (req, res) => {
  const { id } = req.params;
  try {
    const medicine = await Inventory.findByIdAndDelete(id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found.' });
    res.json({ message: 'Medicine deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= MEDICATION SEARCH =================

// Search medications with auto-suggestions
export const searchMedications = async (req, res) => {
  const { query } = req.query;
  
  if (!query || query.length < 2) {
    return res.json([]);
  }

  try {
    const medicines = await Inventory.find({
      name: { $regex: query, $options: 'i' }
    }).limit(10);
    
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get medication by ID
export const getMedicationById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const medicine = await Inventory.findById(id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found.' });
    }
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= REORDER ALERTS =================

// Get medicines that need reordering
export const getReorderAlerts = async (req, res) => {
  try {
    const lowStockMedicines = await Inventory.find({ needsReorder: true });
    res.json({
      count: lowStockMedicines.length,
      medicines: lowStockMedicines
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get inventory summary with alerts
export const getInventorySummary = async (req, res) => {
  try {
    const totalMedicines = await Inventory.countDocuments();
    const lowStockCount = await Inventory.countDocuments({ needsReorder: true });
    const outOfStockCount = await Inventory.countDocuments({ quantity: 0 });
    
    const lowStockMedicines = await Inventory.find({ needsReorder: true })
      .select('name quantity reorderThreshold reorderQuantity supplier')
      .limit(10);
    
    res.json({
      summary: {
        totalMedicines,
        lowStockCount,
        outOfStockCount,
        alertLevel: lowStockCount > 0 ? 'warning' : 'normal'
      },
      lowStockMedicines
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark medicine as reordered
export const markAsReordered = async (req, res) => {
  const { id } = req.params;
  const { reorderQuantity } = req.body;
  
  try {
    const medicine = await Inventory.findById(id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found.' });
    
    // Update last reorder date and add reorder quantity
    medicine.lastReorderDate = new Date();
    medicine.quantity += (reorderQuantity || medicine.reorderQuantity);
    medicine.needsReorder = medicine.quantity <= medicine.reorderThreshold;
    
    await medicine.save();
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= BULK UPLOAD =================

// CSV upload: expects 'file' in req.file (using multer)
export const bulkUploadMedicines = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  try {
    const csvString = req.file.buffer.toString();
    const records = await csv().fromString(csvString);

    let inserted = 0, updated = 0, errors = [];

    for (const rec of records) {
      const { name, price, quantity, reorderThreshold, reorderQuantity, supplier } = rec;
      if (!name || !price) {
        errors.push({ row: rec, error: 'Missing name or price' });
        continue;
      }
      let med = await Inventory.findOne({ name: name.trim() });
      if (med) {
        med.price = Number(price);
        if (quantity !== undefined) {
          med.quantity += Number(quantity);
        }
        if (reorderThreshold !== undefined) {
          med.reorderThreshold = Number(reorderThreshold);
        }
        if (reorderQuantity !== undefined) {
          med.reorderQuantity = Number(reorderQuantity);
        }
        if (supplier !== undefined) {
          med.supplier = supplier;
        }
        await med.save();
        updated++;
      }
      else {
        await Inventory.create({
          name: name.trim(),
          price: Number(price),
          quantity: quantity !== undefined ? Number(quantity) : 0,
          reorderThreshold: reorderThreshold !== undefined ? Number(reorderThreshold) : 10,
          reorderQuantity: reorderQuantity !== undefined ? Number(reorderQuantity) : 50,
          supplier: supplier || 'Default Supplier'
        });
        inserted++;
      }
    }
    res.json({ inserted, updated, errors });
  } catch (err) {
    res.status(500).json({ message: 'CSV processing failed', error: err.message });
  }
};
