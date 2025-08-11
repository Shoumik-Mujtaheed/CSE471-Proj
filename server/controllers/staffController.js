// server/controllers/staffController.js
import User from '../models/User.js';
import Staff from '../models/Staff.js';
import LeaveRequest from '../models/LeaveRequest.js';
import jwt from 'jsonwebtoken';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

/* ========================== AUTH ========================== */

// POST /api/staff/auth/register
export const registerStaff = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, department } = req.body;

    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const user = new User({
      name,
      email,
      password,
      phoneNumber,
      role: 'staff',
    });
    await user.save();

    const staff = new Staff({ 
      user: user._id, 
      department: department || 'General' 
    });
    await staff.save();

    const token = signToken(user._id);

    return res.status(201).json({
      token,
      staff: {
        id: staff._id,
        name: user.name,
        email: user.email,
        department: staff.department,
      },
      role: 'staff',
      nextPath: '/staff',
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message: msg });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

// POST /api/staff/auth/login
export const loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase(), role: 'staff' });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials.' });

    const staff = await Staff.findOne({ user: user._id });
    const token = signToken(user._id);

    return res.json({
      token,
      staff: {
        id: staff._id,
        name: user.name,
        email: user.email,
        department: staff.department,
      },
      role: 'staff',
      nextPath: '/staff',
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

/* =================== LEAVE REQUEST FEATURES ====================== */

// GET /api/staff/leave-requests
// List staff's leave requests
export const getMyLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ 
      requester: req.user.staffId,
      requesterType: 'Staff'
    }).sort({ createdAt: -1 });
    
    res.json(leaveRequests);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/staff/leave-requests
// Submit a new leave request
export const requestLeave = async (req, res) => {
  try {
    const { 
      leaveType, 
      startDate, 
      endDate, 
      reason, 
      isEmergency 
    } = req.body;

    // Validation
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ 
        message: 'Leave type, start date, end date, and reason are required' 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    if (start > end) {
      return res.status(400).json({ message: 'Start date must be before or equal to end date' });
    }

    // Check for overlapping leave requests
    const overlappingLeave = await LeaveRequest.findOne({
      requester: req.user.staffId,
      requesterType: 'Staff',
      status: { $in: ['pending', 'approved'] },
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    if (overlappingLeave) {
      return res.status(409).json({ 
        message: 'You already have a leave request for this period' 
      });
    }

    const leaveRequest = await LeaveRequest.create({
      requester: req.user.staffId,
      requesterType: 'Staff',
      leaveType,
      startDate: start,
      endDate: end,
      reason: reason.trim(),
      isEmergency: isEmergency || false
    });

    res.status(201).json(leaveRequest);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/staff/leave-requests/:id
// Update a pending leave request
export const updateLeaveRequest = async (req, res) => {
  try {
    const { 
      leaveType, 
      startDate, 
      endDate, 
      reason, 
      isEmergency 
    } = req.body;

    const leaveRequest = await LeaveRequest.findOne({
      _id: req.params.id,
      requester: req.user.staffId,
      requesterType: 'Staff'
    });

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Can only update pending leave requests' 
      });
    }

    // Update fields if provided
    if (leaveType) leaveRequest.leaveType = leaveType;
    if (startDate) leaveRequest.startDate = new Date(startDate);
    if (endDate) leaveRequest.endDate = new Date(endDate);
    if (reason) leaveRequest.reason = reason.trim();
    if (isEmergency !== undefined) leaveRequest.isEmergency = isEmergency;

    await leaveRequest.save();
    res.json(leaveRequest);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/staff/leave-requests/:id
// Cancel a pending leave request
export const cancelLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findOne({
      _id: req.params.id,
      requester: req.user.staffId,
      requesterType: 'Staff'
    });

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Can only cancel pending leave requests' 
      });
    }

    await LeaveRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave request cancelled successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/staff/profile
// Get staff profile
export const getStaffProfile = async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.staffId).populate('user', 'name email phoneNumber');
    if (!staff) {
      return res.status(404).json({ message: 'Staff profile not found' });
    }
    res.json(staff);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
