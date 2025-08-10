import express from 'express';
import { 
  createPrescription, 
  getAllPrescriptions, 
  getAllPatients, 
  getAllDoctors 
} from '../controllers/PrescriptionController.js';
//import adminAuth from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

router.post('/', createPrescription);
router.get('/', getAllPrescriptions);
router.get('/patients', getAllPatients);
router.get('/doctors', getAllDoctors);

export default router;
