import express from 'express';
import { 
  createPrescription, 
  getAllPrescriptions, 
  getAllPatients, 
  getAllDoctors,
  getPrescriptionById,
  getPrescriptionsByPatient,
  updatePrescription,
  cancelPrescription
} from '../controllers/PrescriptionController.js';

const router = express.Router();

router.post('/', createPrescription);
router.get('/', getAllPrescriptions);
router.get('/patients', getAllPatients);
router.get('/doctors', getAllDoctors);
router.get('/:id', getPrescriptionById);
router.get('/patient/:patientId', getPrescriptionsByPatient);
router.put('/:id', updatePrescription);
router.delete('/:id', cancelPrescription);

export default router;
