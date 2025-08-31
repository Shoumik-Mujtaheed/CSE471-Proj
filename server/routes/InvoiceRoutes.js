import express from 'express';
import { 
  getAllInvoices, 
  getInvoiceById, 
  updateInvoiceStatus 
} from '../controllers/InvoiceController.js';

const router = express.Router();

router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id/status', updateInvoiceStatus);

export default router;
