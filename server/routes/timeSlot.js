import express from 'express';
import { protect } from '../middleware/auth.js';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';
import {
  getAllTimeSlots,
  getAvailableTimeSlots,
  requestTimeSlot,
  approveTimeSlot,
  rejectTimeSlot,
  getDoctorTimeSlots,
  getDoctorAvailableTimes
} from '../controllers/timeSlotController.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/available', getAvailableTimeSlots); // Patients can see available slots
router.get('/doctor/:doctorId/available', getDoctorAvailableTimes); // Get doctor's available times

// Admin routes (admin authentication required) - NO protect middleware
router.get('/', adminAuthMiddleware, getAllTimeSlots); // Admin sees all time slots
router.patch('/:id/approve', adminAuthMiddleware, approveTimeSlot); // Admin approves time slot
router.patch('/:id/reject', adminAuthMiddleware, rejectTimeSlot); // Admin rejects time slot

// Protected routes (authentication required) - for doctors and patients
router.use(protect);

// Doctor routes
router.post('/request', requestTimeSlot); // Doctor requests time slot
router.get('/doctor/:doctorId', getDoctorTimeSlots); // Get doctor's assigned slots
router.get('/doctor/me', getDoctorTimeSlots); // Get current doctor's assigned slots

export default router;
