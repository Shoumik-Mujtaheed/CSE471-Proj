import express from 'express';
import { 
  createPrescription, 
  getAllPrescriptions, 
  getAllPatients, 
  getAllDoctors 
} from '../controllers/PrescriptionController.js';
import adminAuth from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

router.post('/', adminAuth, createPrescription);
router.get('/', adminAuth, getAllPrescriptions);
router.get('/patients', adminAuth, getAllPatients);
router.get('/doctors', adminAuth, getAllDoctors);

export default router;
