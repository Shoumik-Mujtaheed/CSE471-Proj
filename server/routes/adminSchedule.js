import express from 'express';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';
import {
  getAllSchedules,
  approveSchedule,
  rejectSchedule,
  getPendingSchedulesCount,
  getScheduleOverview
} from '../controllers/adminScheduleController.js';

const router = express.Router();

// Apply admin auth middleware to all routes
router.use(adminAuthMiddleware);

// GET /api/admin/schedules - Get all doctor schedules for admin review
router.get('/schedules', getAllSchedules);

// PATCH /api/admin/schedules/:id/approve - Approve a doctor schedule
router.patch('/schedules/:id/approve', approveSchedule);

// PATCH /api/admin/schedules/:id/reject - Reject a doctor schedule
router.patch('/schedules/:id/reject', rejectSchedule);

// GET /api/admin/schedules/pending - Get pending schedules count
router.get('/schedules/pending', getPendingSchedulesCount);

// GET /api/admin/schedules/overview - Get schedule overview for admin dashboard
router.get('/schedules/overview', getScheduleOverview);

export default router;
