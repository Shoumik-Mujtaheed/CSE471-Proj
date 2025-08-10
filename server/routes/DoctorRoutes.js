// server/routes/DoctorRoutes.js
import express from 'express';
import {getDoctorProfile,updateDoctorProfile,updateAppointmentTimes,getSpecialtyOptions} from '../controllers/DoctorController.js';
//import {createPrescription,getMyPrescriptions,getPrescriptionById,updatePrescription,deletePrescription} from '../controllers/PrescriptionController.js';
import { userAuth } from '../middleware/userAuthMiddleware.js';

const router = express.Router();

/* ---------- Doctor Profile Management ---------- */
router.get('/profile', userAuth('doctor'), getDoctorProfile);
router.post('/profile', userAuth('doctor'), updateDoctorProfile);
router.put('/appointment-times', userAuth('doctor'), updateAppointmentTimes);
router.get('/specialty-options', userAuth('doctor'), getSpecialtyOptions);

/* ---------- Doctor Prescription Management ---------- */
// Only include these if you have prescription controller functions
// router.post('/prescriptions', userAuth('doctor'), createPrescription);
// router.get('/prescriptions', userAuth('doctor'), getMyPrescriptions);
// router.get('/prescriptions/:id', userAuth('doctor'), getPrescriptionById);
// router.put('/prescriptions/:id', userAuth('doctor'), updatePrescription);
// router.delete('/prescriptions/:id', userAuth('doctor'), deletePrescription);

export default router;
