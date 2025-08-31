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
    const { doctorId, bookedDate, timeSlot, reason, urgency } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!doctorId || !bookedDate || !timeSlot || !reason) {
      return res.status(400).json({
        message: 'Missing required fields: doctorId, bookedDate, timeSlot, reason'
      });
    }

    // Validate timeSlot
    const VALID_SLOTS = ['8-12', '12-4', '4-8', '20-00'];
    if (!VALID_SLOTS.includes(timeSlot)) {
      return res.status(400).json({ message: 'Invalid time slot' });
    }

    // Parse/validate bookedDate
    const dayStart = normalizeToLocalDayStart(bookedDate);
    if (isNaN(dayStart.getTime())) {
      return res.status(400).json({ message: 'Invalid bookedDate' });
    }

    // Optional: prevent booking in the past
    const nowStart = normalizeToLocalDayStart(new Date());
    if (dayStart < nowStart) {
      return res.status(400).json({ message: 'Cannot book an appointment in the past' });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Derive weekday from bookedDate
    const derivedDayOfWeek = dayStart.getDay();

    // Validate doctor weekly availability template for this weekday + slot
    // Assumes TimeSlot documents represent weekly templates (not dated instances)
    const templateSlot = await TimeSlot.findOne({
      dayOfWeek: derivedDayOfWeek,
      timeSlot: timeSlot,
      assignedTo: doctorId,
      status: 'ASSIGNED'
    });

    if (!templateSlot) {
      return res.status(400).json({
        message: 'Doctor is not available on the selected day and time slot'
      });
    }

    // Check if slot is already booked for this doctor and date
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      bookedDate: dayStart,
      timeSlot: timeSlot,
      status: { $in: ['booked', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: 'This time slot is already booked for the selected date'
      });
    }

    // Create appointment with concrete date
    const appointment = new Appointment({
      user: userId,
      doctor: doctorId,
      bookedDate: dayStart,
      dayOfWeek: derivedDayOfWeek, // stored for faster filtering; derived from bookedDate
      timeSlot: timeSlot,
      reason: reason.trim(),
      urgency: urgency || 'normal'
      // Optionally set startTime/endTime here if you map from timeSlot
    });

    await appointment.save();

    // Populate doctor and user info for response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('user', 'name email')
      .populate({
        path: 'doctor',
        select: 'specialty',
        populate: { path: 'user', select: 'name email' }
      });

    return res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/appointments - Get authenticated patient’s appointments
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

// GET /api/appointments/doctor/me - Get authenticated doctor’s appointments
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

// PUT /api/appointments/:id - Update appointment (only if still booked)
export const updateAppointment = async (req, res) => {
  try {
    const { bookedDate, timeSlot, reason, urgency } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (appointment.status !== 'booked') {
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
  cancelAppointment
};
