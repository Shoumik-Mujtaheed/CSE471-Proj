// server/routes/AdminRoutes.js

import express from 'express';
import {
  // Authentication
  adminLogin,
  getAdminProfile,
  getPatients,
  // Doctor Management
  listDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,

  // Staff Management
  listStaff,
  getStaff,
  updateStaff,
  deleteStaff,
  setStaffWorkingHours,

  // Leave Request Management
  listPendingLeaveRequests,
  listAllLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeaveRequestStats,
} from '../controllers/AdminController.js';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/_ping', (_req, res) => res.json({ ok: true }));
router.post('/login', adminLogin);

// Protected routes (admin authentication required)
router.use(adminAuthMiddleware); // Apply admin auth to all routes below

// Admin profile
router.get('/profile', getAdminProfile);

// User (patients profiles)
router.get('/patients', getPatients);

// Doctor management routes
router.get('/doctors', listDoctors);
router.get('/doctors/:id', getDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);


// Staff management routes
router.get('/staff', listStaff);
router.get('/staff/:id', getStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);
router.patch('/staff/:id/working-hours', setStaffWorkingHours);



// Leave request management routes
router.get('/leave-requests', listPendingLeaveRequests);
router.get('/leave-requests/all', listAllLeaveRequests);
router.get('/leave-requests/stats', getLeaveRequestStats);
router.post('/leave-requests/:id/approve', approveLeaveRequest);
router.post('/leave-requests/:id/reject', rejectLeaveRequest);

export default router;
