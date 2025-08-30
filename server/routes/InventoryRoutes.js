import express from 'express';
import multer from 'multer';

import {
  getAllMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  bulkUploadMedicines,
  getReorderAlerts,
  getInventorySummary,
  markAsReordered,
  searchMedications,
  getMedicationById
} from '../controllers/InventoryController.js';

const router = express.Router();
const upload = multer(); // memory storage (buffer), as CSVs are usually small

// ================= BASIC INVENTORY OPERATIONS =================

// Get all medicines
router.get('/', getAllMedicines);

// Add medicine
router.post('/', addMedicine);

// Update medicine
router.put('/:id', updateMedicine);

// Delete medicine
router.delete('/:id',  deleteMedicine);

// Bulk upload by CSV
router.post('/bulk-upload', upload.single('file'), bulkUploadMedicines);

// ================= MEDICATION SEARCH =================

// Search medications with auto-suggestions
router.get('/search', searchMedications);

// Get specific medication details
router.get('/medication/:id', getMedicationById);

// ================= REORDER ALERTS =================

// Get reorder alerts (medicines that need reordering)
router.get('/alerts/reorder', getReorderAlerts);

// Get inventory summary with alerts
router.get('/summary', getInventorySummary);

// Mark medicine as reordered
router.post('/:id/reorder', markAsReordered);

export default router;
