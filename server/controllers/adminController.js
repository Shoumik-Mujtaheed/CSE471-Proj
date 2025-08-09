// server/controllers/adminController.js
// Auth removed: no jwt, no login
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Staff from '../models/Staff.js';
import TimeSlot from '../models/TimeSlot.js';
import LeaveRequest from '../models/LeaveRequest.js';

// Utility: convert HH:mm to minutes from midnight
const toMinutes = (hhmm) => {
  if (typeof hhmm !== 'string') return NaN;
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  if (h < 0 || h > 23 || m < 0 || m > 59) return NaN;
  return h * 60 + m;
};

const intervalsOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

/* ============= DOCTORS (NO CREATE) ============= */

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
    const { name, email, phoneNumber, password, specialty, department, appointmentTimes } = req.body;

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
    if (appointmentTimes !== undefined) doctor.appointmentTimes = appointmentTimes;

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

// PATCH /api/admin/doctors/:id/working-hours
export const setDoctorWorkingHours = async (req, res) => {
  try {
    const { appointmentTimes } = req.body; // [{dayOfWeek,startTime,endTime}, ...]
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { appointmentTimes: Array.isArray(appointmentTimes) ? appointmentTimes : [] },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ============== STAFF (NO CREATE) ============== */

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

/* ============== SLOT REQUESTS (Admin) ============== */

// GET /api/admin/slot-requests
export const listPendingSlotRequests = async (_req, res) => {
  try {
    const slots = await TimeSlot.find({ status: 'requested' }).populate('doctor', 'user');
    res.json(slots);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/admin/slot-requests/:id/approve
export const approveSlotRequest = async (req, res) => {
  try {
    const slot = await TimeSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.status !== 'requested') {
      return res.status(400).json({ message: 'Slot is not pending approval' });
    }

    // Check conflicts with existing approved/available/booked/unavailable slots on same date
    const sameDateSlots = await TimeSlot.find({
      doctor: slot.doctor,
      date: slot.date,
      _id: { $ne: slot._id },
      status: { $in: ['available', 'booked', 'unavailable'] },
    });

    const reqStart = toMinutes(slot.startTime);
    const reqEnd = toMinutes(slot.endTime);
    const hasConflict = sameDateSlots.some((s) =>
      intervalsOverlap(reqStart, reqEnd, toMinutes(s.startTime), toMinutes(s.endTime))
    );
    if (hasConflict) {
      return res.status(409).json({ message: 'Conflict with existing slot. Reject or adjust.' });
    }

    slot.status = 'available';
    await slot.save();
    res.json(slot);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/admin/slot-requests/:id/reject
export const rejectSlotRequest = async (req, res) => {
  try {
    const slot = await TimeSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.status !== 'requested') {
      return res.status(400).json({ message: 'Slot is not pending approval' });
    }
    await TimeSlot.findByIdAndDelete(slot._id);
    res.json({ message: 'Slot request rejected and removed' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ============== LEAVE REQUESTS (Admin) ============== */

// GET /api/admin/leave-requests
// List all pending leave requests (doctors and staff)
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
      // Default to pending if no status specified
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

// GET /api/admin/leave-requests/all
// List all leave requests with filtering options
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

// POST /api/admin/leave-requests/:id/approve
// Approve a leave request
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
    // Note: You might want to add admin ID here if you have admin authentication
    // leaveRequest.approvedBy = req.admin._id;
    
    await leaveRequest.save();

    // Populate requester details for response
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
// Reject a leave request
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

    // Populate requester details for response
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

// GET /api/admin/leave-requests/stats
// Get leave request statistics
export const getLeaveRequestStats = async (req, res) => {
  try {
    const stats = await LeaveRequest.aggregate([
      {
        $group: {
          _id: {
            status: '$status',
            requesterType: '$requesterType'
          },
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' }
        }
      },
      {
        $group: {
          _id: '$_id.requesterType',
          statusBreakdown: {
            $push: {
              status: '$_id.status',
              count: '$count',
              totalDays: '$totalDays'
            }
          },
          totalRequests: { $sum: '$count' },
          totalDaysRequested: { $sum: '$totalDays' }
        }
      }
    ]);

    res.json(stats);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
