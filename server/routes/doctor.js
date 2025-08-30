// server/routes/doctor.js
import express from 'express';
import {
  // AUTH
  registerDoctor,
  loginDoctor,
  // FEATURES
  getDoctorPatients,
  searchDoctorsByName,
  // LEAVE REQUESTS
  getMyLeaveRequests,
  requestLeave,
  updateLeaveRequest,
  cancelLeaveRequest
} from '../controllers/doctorController.js';
import {
  // PRESCRIPTION MANAGEMENT
  createPrescription,
  getMyPrescriptions,
  getPrescriptionById,
  updatePrescription,
  cancelPrescription,
  getPatientPrescriptionHistory
} from '../controllers/prescriptionController.js';
import { authenticateDoctor } from '../middleware/auth.js';

const router = express.Router();

/* ---------- AUTH endpoints (no auth required) ---------- */
router.post('/auth/register', registerDoctor);
router.post('/auth/login',    loginDoctor);

router.get('/search', searchDoctorsByName);

/* ---------- Protected doctor endpoints ---------- */
router.use(authenticateDoctor);

router.get('/patients', getDoctorPatients);

// Doctor leave requests
router.get('/leave-requests', getMyLeaveRequests);
router.post('/leave-requests', requestLeave);
router.put('/leave-requests/:id', updateLeaveRequest);
router.delete('/leave-requests/:id', cancelLeaveRequest);

// Doctor prescription management
router.post('/prescriptions', createPrescription);
router.get('/prescriptions', getMyPrescriptions);
router.get('/prescriptions/:id', getPrescriptionById);
router.put('/prescriptions/:id', updatePrescription);
router.delete('/prescriptions/:id', cancelPrescription);
router.get('/patients/:id/prescriptions', getPatientPrescriptionHistory);

export default router;
