// server/controllers/AppointmentController.js
// Complete appointment booking system

import Appointment from '../models/Appointment.js';
import TimeSlot from '../models/TimeSlot.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

/* =================== APPOINTMENT BOOKING ====================== */

// POST /api/appointments - Create new appointment
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, dayOfWeek, timeSlot, reason, urgency } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!doctorId || !date || dayOfWeek === undefined || !timeSlot || !reason) {
      return res.status(400).json({ 
        message: 'Missing required fields: doctorId, date, dayOfWeek, timeSlot, reason' 
      });
    }

    // Validate dayOfWeek (0-6)
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ message: 'Invalid day of week (0-6)' });
    }

    // Validate timeSlot
    if (!['8-12', '12-4', '4-8', '20-00'].includes(timeSlot)) {
      return res.status(400).json({ message: 'Invalid time slot' });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if doctor has approved time slot for this day and time slot (using central TimeSlot system)
    const timeSlotDoc = await TimeSlot.findOne({
      dayOfWeek: dayOfWeek,
      timeSlot: timeSlot,
      assignedTo: doctorId,
      status: 'ASSIGNED',
      hasAppointment: false
    });

    if (!timeSlotDoc) {
      return res.status(400).json({ 
        message: 'Doctor is not available on this day and time slot' 
      });
    }

    // Check if appointment date matches the day of week
    const appointmentDate = new Date(date);
    const appointmentDayOfWeek = appointmentDate.getDay();
    
    if (appointmentDayOfWeek !== dayOfWeek) {
      return res.status(400).json({ 
        message: 'Appointment date does not match the selected day of week' 
      });
    }

    // Check if slot is already booked for this specific date
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: appointmentDate,
      timeSlot: timeSlot,
      status: { $in: ['booked', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        message: 'This time slot is already booked for the selected date' 
      });
    }

    // Create appointment
    const appointment = new Appointment({
      user: userId,
      doctor: doctorId,
      date: appointmentDate,
      dayOfWeek: dayOfWeek,
      timeSlot: timeSlot,
      reason: reason.trim(),
      urgency: urgency || 'normal'
    });

    await appointment.save();

    // Update the time slot to mark it as booked
    timeSlotDoc.hasAppointment = true;
    timeSlotDoc.appointmentId = appointment._id;
    await timeSlotDoc.save();

    // Populate doctor and user info for response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'specialty')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('user', 'name email');

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: populatedAppointment
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/appointments - Get patient's appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate('doctor', 'specialty')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/appointments/patient/:patientId - Get appointments by patient ID (for doctors)
export const getPatientAppointmentsById = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const appointments = await Appointment.find({ user: patientId })
      .populate('doctor', 'specialty')
      .populate('user', 'name email phoneNumber')
      .sort({ date: 1, timeSlot: 1 });

    res.json({ appointments });
  } catch (error) {
    console.error('Get patient appointments by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/appointments/doctor/me - Get doctor's appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    // Get doctor ID from the authenticated user
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate('user', 'name email phoneNumber')
      .populate('doctor', 'specialty')
      .sort({ date: 1, timeSlot: 1 });

    res.json({
      appointments: appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/appointments/:id - Get specific appointment
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'specialty')
      .populate('user', 'name email phoneNumber')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user owns this appointment or is the doctor
    if (appointment.user._id.toString() !== req.user._id.toString() && 
        appointment.doctor._id.toString() !== req.user.doctorId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/appointments/:id - Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const { date, time, reason, urgency } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user owns this appointment
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Can only update booked appointments
    if (appointment.status !== 'booked') {
      return res.status(400).json({ 
        message: 'Can only update booked appointments' 
      });
    }

    // Update fields
    if (date) appointment.date = new Date(date);
    if (time) appointment.time = time;
    if (reason) appointment.reason = reason.trim();
    if (urgency) appointment.urgency = urgency;

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'specialty')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    res.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/appointments/:id - Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user owns this appointment
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update appointment status
    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Server error' });
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
