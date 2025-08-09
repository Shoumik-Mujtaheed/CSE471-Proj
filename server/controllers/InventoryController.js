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
  const { name, price, quantity } = req.body;
  try {
    const exists = await Inventory.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Medicine already exists.' });
    const medicine = new Inventory({ name, price, quantity });
    await medicine.save();
    res.status(201).json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update medicine
export const updateMedicine = async (req, res) => {
  const { id } = req.params;
  const { name, price, quantity } = req.body;
  try {
    const medicine = await Inventory.findByIdAndUpdate(
      id,
      { name, price, quantity },
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

// ================= BULK UPLOAD =================

// CSV upload: expects 'file' in req.file (using multer)
export const bulkUploadMedicines = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  try {
    const csvString = req.file.buffer.toString();
    const records = await csv().fromString(csvString);

    let inserted = 0, updated = 0, errors = [];

    for (const rec of records) {
      const { name, price, quantity } = rec;
      if (!name || !price) {
        errors.push({ row: rec, error: 'Missing name or price' });
        continue;
      }
      let med = await Inventory.findOne({ name: name.trim() });
      if (med) {
        med.price = Number(price); // you probably still want to update the price
        if (quantity !== undefined) {
          med.quantity += Number(quantity); // <-- add new quantity to existing
        }
        await med.save();
          updated++;
      }
      else {
        await Inventory.create({
          name: name.trim(),
          price: Number(price),
          quantity: quantity !== undefined ? Number(quantity) : 0,
        });
        inserted++;
      }
    }
    res.json({ inserted, updated, errors });
  } catch (err) {
    res.status(500).json({ message: 'CSV processing failed', error: err.message });
  }
};
