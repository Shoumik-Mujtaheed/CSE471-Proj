// server/controllers/doctorController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import TimeSlot from '../models/TimeSlot.js';
import LeaveRequest from '../models/LeaveRequest.js';

/* ========================== AUTH ========================== */

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

// POST /api/doctor/auth/register
export const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, specialty } = req.body;

    if (!name || !email || !password || !phoneNumber || !specialty) {
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
      role: 'doctor',
    });
    await user.save();

    const doctor = new Doctor({ user: user._id, specialty });
    await doctor.save();

    const token = signToken(user._id);

    return res.status(201).json({
      token,
      doctor: {
        id: doctor._id,
        name: user.name,
        email: user.email,
        specialty: doctor.specialty,
      },
      role: 'doctor',
      nextPath: '/doctor',
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

// POST /api/doctor/auth/login
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase(), role: 'doctor' });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials.' });

    const doctor = await Doctor.findOne({ user: user._id });
    const token = signToken(user._id);

    return res.json({
      token,
      doctor: {
        id: doctor._id,
        name: user.name,
        email: user.email,
        specialty: doctor.specialty,
      },
      role: 'doctor',
      nextPath: '/doctor',
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

/* =================== DOCTOR FEATURES ====================== */

// Utility: normalize date to midnight for consistent equality comparisons
const normalizeDateOnly = (dateInput) => {
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

// Utility: convert HH:mm to minutes from midnight
const toMinutes = (hhmm) => {
  if (typeof hhmm !== 'string') return NaN;
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  if (h < 0 || h > 23 || m < 0 || m > 59) return NaN;
  return h * 60 + m;
};

// Utility: check if [aStart, aEnd) overlaps [bStart, bEnd)
const intervalsOverlap = (aStart, aEnd, bStart, bEnd) => {
  return aStart < bEnd && bStart < aEnd;
};

// GET /api/doctor/patients
export const getDoctorPatients = async (req, res) => {
  try {
    const appts = await Appointment.find({
      doctor: req.user.doctorId,
      status: { $in: ['booked', 'treated'] },
    }).populate('user', 'name email phoneNumber');
    res.json(appts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/doctor/timeslots
export const getDoctorTimeSlots = async (req, res) => {
  try {
    const slots = await TimeSlot.find({ doctor: req.user.doctorId });
    res.json(slots);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/doctor/slot-requests
// List this doctor's pending slot requests
export const getMySlotRequests = async (req, res) => {
  try {
    const slots = await TimeSlot.find({ doctor: req.user.doctorId, status: 'requested' });
    res.json(slots);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/doctor/slot-requests
// Submit a new appointment slot request (awaiting admin approval)
export const requestAppointmentSlot = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

    const normalizedDate = normalizeDateOnly(date);
    if (!normalizedDate) return res.status(400).json({ message: 'Invalid date' });

    const startMins = toMinutes(startTime);
    const endMins = toMinutes(endTime);
    if (Number.isNaN(startMins) || Number.isNaN(endMins)) {
      return res.status(400).json({ message: 'Invalid time format. Use HH:mm' });
    }
    if (startMins >= endMins) {
      return res.status(400).json({ message: 'startTime must be before endTime' });
    }

    // Conflict detection against ANY existing slot on same date
    const existingSlots = await TimeSlot.find({ doctor: req.user.doctorId, date: normalizedDate });
    const hasConflict = existingSlots.some((s) => {
      const sStart = toMinutes(s.startTime);
      const sEnd = toMinutes(s.endTime);
      return intervalsOverlap(startMins, endMins, sStart, sEnd);
    });
    if (hasConflict) {
      return res.status(409).json({ message: 'Requested time overlaps an existing slot' });
    }

    const created = await TimeSlot.create({
      doctor: req.user.doctorId,
      date: normalizedDate,
      startTime,
      endTime,
      status: 'requested',
    });

    return res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/doctor/timeslots/:id/unavailable
export const markSlotUnavailable = async (req, res) => {
  try {
    const slot = await TimeSlot.findByIdAndUpdate(
      req.params.id,
      { status: 'unavailable' },
      { new: true }
    );
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json(slot);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =================== LEAVE REQUEST FEATURES ====================== */

// GET /api/doctor/leave-requests
// List doctor's leave requests
export const getMyLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ 
      requester: req.user.doctorId,
      requesterType: 'Doctor'
    }).sort({ createdAt: -1 });
    
    res.json(leaveRequests);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/doctor/leave-requests
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
      requester: req.user.doctorId,
      requesterType: 'Doctor',
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
      requester: req.user.doctorId,
      requesterType: 'Doctor',
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

// PUT /api/doctor/leave-requests/:id
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
      requester: req.user.doctorId,
      requesterType: 'Doctor'
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

// DELETE /api/doctor/leave-requests/:id
// Cancel a pending leave request
export const cancelLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findOne({
      _id: req.params.id,
      requester: req.user.doctorId,
      requesterType: 'Doctor'
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
