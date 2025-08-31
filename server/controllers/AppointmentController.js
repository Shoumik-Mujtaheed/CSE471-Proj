// server/controllers/AppointmentController.js

import Appointment from '../models/Appointment.js';
import TimeSlot from '../models/TimeSlot.js'; // Weekly template availability
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

/* =================== APPOINTMENT BOOKING ====================== */

// Helper: normalize a Date (or ISO string) to start of local day (00:00) for stable equality checks
const normalizeToLocalDayStart = (d) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

// POST /api/appointments - Create new appointment
export const createAppointment = async (req, res) => {
  try {
    // 🔥 FIX: Check authenticated user first
    if (!req.user || !req.user._id) {
      console.error('❌ No authenticated user found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { doctorId, bookedDate, timeSlot, reason, urgency } = req.body;
    const userId = req.user._id;

    // 🔥 ADD: Debug logging
    console.log('📝 Creating appointment for user:', userId);
    console.log('📝 Request body:', { doctorId, bookedDate, timeSlot, reason, urgency });

    // Validate required fields
    if (!doctorId || !bookedDate || !timeSlot || !reason) {
      console.error('❌ Missing required fields');
      return res.status(400).json({
        message: 'Missing required fields: doctorId, bookedDate, timeSlot, reason'
      });
    }

    // Validate timeSlot
    const VALID_SLOTS = ['8-12', '12-4', '4-8', '20-00'];
    if (!VALID_SLOTS.includes(timeSlot)) {
      console.error('❌ Invalid time slot:', timeSlot);
      return res.status(400).json({ message: 'Invalid time slot' });
    }

    // Parse/validate bookedDate
    const dayStart = normalizeToLocalDayStart(bookedDate);
    if (isNaN(dayStart.getTime())) {
      console.error('❌ Invalid bookedDate format:', bookedDate);
      return res.status(400).json({ message: 'Invalid bookedDate' });
    }

    // Optional: prevent booking in the past
    const nowStart = normalizeToLocalDayStart(new Date());
    if (dayStart < nowStart) {
      console.error('❌ Cannot book in past:', dayStart, 'vs', nowStart);
      return res.status(400).json({ message: 'Cannot book an appointment in the past' });
    }

    // Check if doctor exists
    console.log('🔍 Looking up doctor:', doctorId);
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.error('❌ Doctor not found:', doctorId);
      return res.status(404).json({ message: 'Doctor not found' });
    }
    console.log('✅ Doctor found:', doctor._id);

    // Derive weekday from bookedDate
    const derivedDayOfWeek = dayStart.getDay();
    console.log('📅 Derived day of week:', derivedDayOfWeek);

    // Validate doctor weekly availability template for this weekday + slot
    console.log('🔍 Checking template slot availability...');
    const templateSlot = await TimeSlot.findOne({
      dayOfWeek: derivedDayOfWeek,
      timeSlot: timeSlot,
      assignedTo: doctorId,
      status: 'ASSIGNED'
    });

    if (!templateSlot) {
      console.error('❌ Doctor not available on selected day/time');
      return res.status(400).json({
        message: 'Doctor is not available on the selected day and time slot'
      });
    }
    console.log('✅ Template slot found');

    // Check if slot is already booked for this doctor and date
    console.log('🔍 Checking for existing appointments...');
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      bookedDate: dayStart,
      timeSlot: timeSlot,
      status: { $in: ['booked', 'confirmed'] }
    });

    if (existingAppointment) {
      console.error('❌ Time slot already booked');
      return res.status(400).json({
        message: 'This time slot is already booked for the selected date'
      });
    }
    console.log('✅ No existing appointment found');

    // Create appointment with concrete date
    console.log('🔍 Creating new appointment...');
    const appointment = new Appointment({
      user: userId,
      doctor: doctorId,
      bookedDate: dayStart,
      dayOfWeek: derivedDayOfWeek, // stored for faster filtering; derived from bookedDate
      timeSlot: timeSlot,
      reason: reason.trim(),
      urgency: urgency || 'normal'
    });

    console.log('💾 Saving appointment...');
    await appointment.save();
    console.log('✅ Appointment saved with ID:', appointment._id);

    // Populate doctor and user info for response
    console.log('🔍 Populating appointment data...');
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('user', 'name email')
      .populate({
        path: 'doctor',
        select: 'specialty',
        populate: { path: 'user', select: 'name email' }
      });

    console.log('🎉 Appointment created successfully');
    return res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: populatedAppointment
    });

  } catch (error) {
    // 🔥 IMPROVED: Enhanced error logging
    console.error('💥 CREATE APPOINTMENT ERROR:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body was:', req.body);
    console.error('User was:', req.user ? req.user._id : 'NO USER');
    
    return res.status(500).json({ 
      message: 'Server error creating appointment',
      error: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message
      } : undefined
    });
  }
};


// GET /api/appointments - Get authenticated patient's appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate('user', 'name email')
      .populate({
        path: 'doctor',
        select: 'specialty',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ bookedDate: 1, timeSlot: 1 });

    return res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/appointments/patient/:patientId - Get appointments by patient ID (for doctors/admin)
export const getPatientAppointmentsById = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ user: patientId })
      .populate('user', 'name email phoneNumber')
      .populate({
        path: 'doctor',
        select: 'specialty',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ bookedDate: 1, timeSlot: 1 });

    return res.json({ appointments });
  } catch (error) {
    console.error('Get patient appointments by ID error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/appointments/doctor/me - Get authenticated doctor's appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate('user', 'name email phoneNumber')
      .populate('doctor', 'specialty')
      .sort({ bookedDate: 1, timeSlot: 1 });

    return res.json({
      appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/appointments/:id - Get specific appointment
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('user', 'name email phoneNumber')
      .populate({
        path: 'doctor',
        select: 'specialty',
        populate: { path: 'user', select: 'name email' }
      });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Access control: owner patient or doctor
    const isOwner = appointment.user._id.toString() === req.user._id.toString();
    // If you store req.user.doctorId for doctor JWT, check that too
    const isDoctor =
      (req.user.role === 'doctor' && String(appointment.doctor) === String(req.user.doctorId)) ||
      false;

    if (!isOwner && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// 🔥 NEW: Function to update appointment status (used by PrescriptionController)
export const updateAppointmentStatus = async (appointmentId, newStatus) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: newStatus },
      { new: true }
    );
    return appointment;
  } catch (error) {
    console.error('Update appointment status error:', error);
    throw error;
  }
};

// PUT /api/appointments/:id - Update appointment (UPDATED to allow status updates)
export const updateAppointment = async (req, res) => {
  try {
    const { bookedDate, timeSlot, reason, urgency, status } = req.body; // Added status
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // 🔥 NEW: Allow status updates for doctors/admin or when marking as completed
    if (status) {
      if (req.user.role === 'doctor' || req.user.role === 'admin' || status === 'completed') {
        appointment.status = status;
      } else {
        return res.status(400).json({ message: 'Insufficient permissions to update status' });
      }
    } else if (appointment.status !== 'booked') {
      return res.status(400).json({ message: 'Can only update booked appointments' });
    }

    // If changing date or slot, re‑validate availability
    let newDate = appointment.bookedDate;
    let newSlot = appointment.timeSlot;

    if (bookedDate) {
      const normalized = normalizeToLocalDayStart(bookedDate);
      if (isNaN(normalized.getTime())) {
        return res.status(400).json({ message: 'Invalid bookedDate' });
      }
      newDate = normalized;
    }

    if (timeSlot) {
      const VALID_SLOTS = ['8-12', '12-4', '4-8', '20-00'];
      if (!VALID_SLOTS.includes(timeSlot)) {
        return res.status(400).json({ message: 'Invalid time slot' });
      }
      newSlot = timeSlot;
    }

    // If date or slot changed, verify doctor availability and collisions
    if (bookedDate || timeSlot) {
      const derivedDayOfWeek = new Date(newDate).getDay();

      const templateSlot = await TimeSlot.findOne({
        dayOfWeek: derivedDayOfWeek,
        timeSlot: newSlot,
        assignedTo: appointment.doctor,
        status: 'ASSIGNED'
      });
      if (!templateSlot) {
        return res.status(400).json({
          message: 'Doctor is not available on the selected day and time slot'
        });
      }

      const collision = await Appointment.findOne({
        _id: { $ne: appointment._id },
        doctor: appointment.doctor,
        bookedDate: newDate,
        timeSlot: newSlot,
        status: { $in: ['booked', 'confirmed'] }
      });
      if (collision) {
        return res.status(400).json({
          message: 'This time slot is already booked for the selected date'
        });
      }

      appointment.bookedDate = newDate;
      appointment.dayOfWeek = derivedDayOfWeek;
      appointment.timeSlot = newSlot;
    }

    if (reason) appointment.reason = reason.trim();
    if (urgency) appointment.urgency = urgency;

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('user', 'name email')
      .populate({
        path: 'doctor',
        select: 'specialty',
        populate: { path: 'user', select: 'name email' }
      });

    return res.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/appointments/:id - Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    return res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default {
  createAppointment,
  getPatientAppointments,
  getPatientAppointmentsById,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus, 
  cancelAppointment
};
