// server/routes/admin.js
import express from 'express';
import {
  // ---- Doctors (NO CREATE) ----
  listDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  setDoctorWorkingHours,
  // ---- Staff (NO CREATE) ----
  listStaff,
  getStaff,
  updateStaff,
  deleteStaff,
  setStaffWorkingHours,
  // ---- Slot Requests ----
  listPendingSlotRequests,
  approveSlotRequest,
  rejectSlotRequest,
  // ---- Leave Requests ----
  listPendingLeaveRequests,
  listAllLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeaveRequestStats,
} from '../controllers/adminController.js';

const router = express.Router();

/* ---------- PUBLIC health (no auth) ---------- */
router.get('/_ping', (_req, res) => res.json({ ok: true }));

/* ---------- PUBLIC admin endpoints (NO AUTH) ---------- */
// Doctors
router.get('/doctors', listDoctors);
router.get('/doctors/:id', getDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);
router.patch('/doctors/:id/working-hours', setDoctorWorkingHours);

// Staff
router.get('/staff', listStaff);
router.get('/staff/:id', getStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);
router.patch('/staff/:id/working-hours', setStaffWorkingHours);

// Slot Requests
router.get('/slot-requests', listPendingSlotRequests);
router.post('/slot-requests/:id/approve', approveSlotRequest);
router.post('/slot-requests/:id/reject', rejectSlotRequest);

// Leave Requests
router.get('/leave-requests', listPendingLeaveRequests);
router.get('/leave-requests/all', listAllLeaveRequests);
router.get('/leave-requests/stats', getLeaveRequestStats);
router.post('/leave-requests/:id/approve', approveLeaveRequest);
router.post('/leave-requests/:id/reject', rejectLeaveRequest);

export default router;
