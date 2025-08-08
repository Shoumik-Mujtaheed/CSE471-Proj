import express from 'express';
import { 
  getAllInvoices, 
  getInvoiceById, 
  updateInvoiceStatus 
} from '../controllers/InvoiceController.js';
import adminAuth from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

router.get('/', adminAuth, getAllInvoices);
router.get('/:id', adminAuth, getInvoiceById);
router.put('/:id/status', adminAuth, updateInvoiceStatus);

export default router;
