// routes/medications.js
import express from 'express';
import multer from 'multer';
import {
  searchMedications,
  getAllMedications,
  getMedicationById
} from '../controllers/medicationController.js';
// Import the inventory bulk upload function since medications are stored in Inventory
import { bulkUploadMedicines } from '../controllers/InventoryController.js';

const router = express.Router();
const upload = multer(); // memory storage for CSV files

/* =================== MEDICATION ROUTES ====================== */

// Search medications with auto-suggestions
router.get('/search', searchMedications);

// Get all medications with filters and pagination
router.get('/', getAllMedications);

// Get specific medication details
router.get('/:id', getMedicationById);

// Bulk upload medications via CSV
router.post('/bulk-upload', upload.single('file'), bulkUploadMedicines);

export default router;
