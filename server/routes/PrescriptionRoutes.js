import express from 'express';
import { 
  createPrescription, 
  getAllPrescriptions, 
  getAllPatients, 
  getAllDoctors,
  getPrescriptionById,
  updatePrescription,
  cancelPrescription
} from '../controllers/PrescriptionController.js';
//import adminAuth from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

router.post('/', createPrescription);
router.get('/', getAllPrescriptions);
router.get('/patients', getAllPatients);
router.get('/doctors', getAllDoctors);
router.get('/:id', getPrescriptionById);
router.put('/:id', updatePrescription);
router.delete('/:id', cancelPrescription);

export default router;
