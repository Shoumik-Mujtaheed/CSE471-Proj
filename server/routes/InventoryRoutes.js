import express from 'express';
import multer from 'multer';

import {
  getAllMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  bulkUploadMedicines
} from '../controllers/InventoryController.js';
import adminAuth from '../middleware/adminAuthMiddleware.js'; // You must create this middleware

const router = express.Router();
const upload = multer(); // memory storage (buffer), as CSVs are usually small

// Get all (admin-only)
router.get('/', adminAuth, getAllMedicines);

// Add medicine
router.post('/', adminAuth, addMedicine);

// Update medicine
router.put('/:id', adminAuth, updateMedicine);

// Delete medicine
router.delete('/:id', adminAuth,  deleteMedicine);

// Bulk upload by CSV
router.post('/bulk-upload',adminAuth, upload.single('file'), bulkUploadMedicines);

export default router;
