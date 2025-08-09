import express from 'express';
import multer from 'multer';

import {
  getAllMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  bulkUploadMedicines
} from '../controllers/InventoryController.js';
//import adminAuth from '../middleware/adminAuthMiddleware.js'; // You must create this middleware

const router = express.Router();
const upload = multer(); // memory storage (buffer), as CSVs are usually small

// Get all (admin-only)
router.get('/',  getAllMedicines);

// Add medicine
router.post('/',  addMedicine);

// Update medicine
router.put('/:id', updateMedicine);

// Delete medicine
router.delete('/:id',  deleteMedicine);

// Bulk upload by CSV
router.post('/bulk-upload', upload.single('file'), bulkUploadMedicines);

export default router;
