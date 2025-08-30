// server/controllers/AdminController.js

import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Staff from '../models/Staff.js';
import LeaveRequest from '../models/LeaveRequest.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Generate JWT token for admin
const generateAdminToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '8h' });
};

// POST /api/admin/login - Admin authentication
export const adminLogin = async (req, res) => {
  const { name, password } = req.body;
  
  try {
    if (!name || !password) {
      return res.status(400).json({ message: 'Name and password required' });
    }

    // Find admin by name
    const admin = await Admin.findOne({ name: name });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateAdminToken(admin._id);
    
    res.json({ 
      token, 
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      message: 'Admin login successful'
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Add this function to your AdminController.js

export const getPatients = async (req, res) => {
  try {
    // Fetch all users with role 'patient'
    const patients = await User.find({ role: 'patient' })
      .select('name email phoneNumber bloodGroup createdAt')
      .sort({ createdAt: -1 });

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// GET /api/admin/profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



/* ============= DOCTORS MANAGEMENT ============= */

// GET /api/admin/doctors
export const listDoctors = async (_req, res) => {
  try {
    const doctors = await Doctor.find().populate('user', 'name email phoneNumber role');
    res.json(doctors);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/admin/doctors/:id
export const getDoctor = async (req, res) => {
  try {
    const d = await Doctor.findById(req.params.id).populate('user', 'name email phoneNumber role');
    if (!d) return res.status(404).json({ message: 'Doctor not found' });
    res.json(d);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// PUT /api/admin/doctors/:id
export const updateDoctor = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, specialty, department } = req.body;

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const user = await User.findById(doctor.user);

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = String(email).toLowerCase();
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (password) user.password = password; // will hash via User pre-save
    await user.save();

    if (specialty !== undefined) doctor.specialty = specialty;
    if (department !== undefined) doctor.department = department;


    await doctor.save();

    res.json({ message: 'Doctor updated' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DELETE /api/admin/doctors/:id
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    await User.findByIdAndDelete(doctor.user);
    await Doctor.findByIdAndDelete(doctor._id);

    res.json({ message: 'Doctor deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};



/* ============== STAFF MANAGEMENT ============== */

// GET /api/admin/staff
export const listStaff = async (_req, res) => {
  try {
    const staff = await Staff.find().populate('user', 'name email phoneNumber role');
    res.json(staff);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/admin/staff/:id
export const getStaff = async (req, res) => {
  try {
    const s = await Staff.findById(req.params.id).populate('user', 'name email phoneNumber role');
    if (!s) return res.status(404).json({ message: 'Staff not found' });
    res.json(s);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// PUT /api/admin/staff/:id
export const updateStaff = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, department, shifts } = req.body;

    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const user = await User.findById(staff.user);
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = String(email).toLowerCase();
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (password) user.password = password; // will hash via User pre-save
    await user.save();

    if (department !== undefined) staff.department = department;
    if (shifts !== undefined) staff.shifts = shifts;
    await staff.save();

    res.json({ message: 'Staff updated' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DELETE /api/admin/staff/:id
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    await User.findByIdAndDelete(staff.user);
    await Staff.findByIdAndDelete(staff._id);

    res.json({ message: 'Staff deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// PATCH /api/admin/staff/:id/working-hours
export const setStaffWorkingHours = async (req, res) => {
  try {
    const { shifts } = req.body; // [{startTime,endTime,days:[..]}]
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { shifts: Array.isArray(shifts) ? shifts : [] },
      { new: true }
    );
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ============== SLOT REQUESTS MANAGEMENT ============== */




/* ============== LEAVE REQUESTS MANAGEMENT ============== */

// GET /api/admin/leave-requests
export const listPendingLeaveRequests = async (req, res) => {
  try {
    const { type, status } = req.query;
    
    let filter = {};
    if (type && ['Doctor', 'Staff'].includes(type)) {
      filter.requesterType = type;
    }
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    } else {
      filter.status = 'pending';
    }

    const leaveRequests = await LeaveRequest.find(filter)
      .populate({
        path: 'requester',
        select: 'user specialty department',
        populate: {
          path: 'user',
          select: 'name email phoneNumber'
        }
      })
      .sort({ createdAt: -1 });

    res.json(leaveRequests);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/admin/leave-requests/:id/approve
export const approveLeaveRequest = async (req, res) => {
  try {
    const { adminComment } = req.body;
    
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request is not pending' });
    }

    leaveRequest.status = 'approved';
    if (adminComment) {
      leaveRequest.adminComment = adminComment.trim();
    }
    
    await leaveRequest.save();

    await leaveRequest.populate({
      path: 'requester',
      select: 'user specialty department',
      populate: {
        path: 'user',
        select: 'name email phoneNumber'
      }
    });

    res.json(leaveRequest);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/admin/leave-requests/:id/reject
export const rejectLeaveRequest = async (req, res) => {
  try {
    const { adminComment } = req.body;
    
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request is not pending' });
    }

    leaveRequest.status = 'rejected';
    if (adminComment) {
      leaveRequest.adminComment = adminComment.trim();
    }
    
    await leaveRequest.save();

    await leaveRequest.populate({
      path: 'requester',
      select: 'user specialty department',
      populate: {
        path: 'user',
        select: 'name email phoneNumber'
      }
    });

    res.json(leaveRequest);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/admin/leave-requests/all
export const listAllLeaveRequests = async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    
    let filter = {};
    if (type && ['Doctor', 'Staff'].includes(type)) {
      filter.requesterType = type;
    }
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }
    if (startDate && endDate) {
      filter.startDate = { $gte: new Date(startDate) };
      filter.endDate = { $lte: new Date(endDate) };
    }

    const leaveRequests = await LeaveRequest.find(filter)
      .populate({
        path: 'requester',
        select: 'user specialty department',
        populate: {
          path: 'user',
          select: 'name email phoneNumber'
        }
      })
      .sort({ createdAt: -1 });

    res.json(leaveRequests);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/admin/leave-requests/stats
export const getLeaveRequestStats = async (req, res) => {
  try {
    const stats = await LeaveRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' }
        }
      }
    ]);

    const typeStats = await LeaveRequest.aggregate([
      {
        $group: {
          _id: '$requesterType',
          count: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      statusStats: stats,
      typeStats: typeStats
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

