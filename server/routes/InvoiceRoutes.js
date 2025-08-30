import express from 'express';
import { 
  getAllInvoices, 
  getInvoiceById, 
  updateInvoiceStatus 
} from '../controllers/InvoiceController.js';
<<<<<<< HEAD
//import adminAuth from '../middleware/adminAuthMiddleware.js';
=======
>>>>>>> shoumikfinal

const router = express.Router();

router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id/status', updateInvoiceStatus);

export default router;
