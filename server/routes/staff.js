// server/routes/staff.js
import express from 'express';
import {
  // AUTH
  registerStaff,
  loginStaff,
  // FEATURES
  getStaffProfile,
  // LEAVE REQUESTS
  getMyLeaveRequests,
  requestLeave,
  updateLeaveRequest,
  cancelLeaveRequest
} from '../controllers/staffController.js';
import { authenticateStaff } from '../middleware/auth.js';

const router = express.Router();

/* ---------- AUTH endpoints (no auth required) ---------- */
router.post('/auth/register', registerStaff);
router.post('/auth/login',    loginStaff);

/* ---------- Protected staff endpoints ---------- */
router.use(authenticateStaff);

router.get('/profile', getStaffProfile);

// Staff leave requests
router.get('/leave-requests', getMyLeaveRequests);
router.post('/leave-requests', requestLeave);
router.put('/leave-requests/:id', updateLeaveRequest);
router.delete('/leave-requests/:id', cancelLeaveRequest);

export default router;
