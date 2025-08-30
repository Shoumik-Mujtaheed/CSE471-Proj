import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createOrUpdateSchedule,
  getDoctorSchedule,
  deleteSchedule,
  getAvailableDays
} from '../controllers/doctorScheduleController.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// POST /api/doctor/schedule - Create or update weekly schedule
router.post('/schedule', createOrUpdateSchedule);

// GET /api/doctor/schedule - Get doctor's current schedule
router.get('/schedule', getDoctorSchedule);

// DELETE /api/doctor/schedule/:id - Delete a schedule
router.delete('/schedule/:id', deleteSchedule);

// GET /api/doctor/schedule/available - Get available days for a time slot
router.get('/schedule/available', getAvailableDays);

export default router;
