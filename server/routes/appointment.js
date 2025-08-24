// server/routes/appointment.js
// Appointment booking routes

import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createAppointment,
  getPatientAppointments,
  getPatientAppointmentsById,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment
} from '../controllers/AppointmentController.js';

const router = express.Router();

// Check if a specific slot is available for booking
router.post('/check-availability', protect, async (req, res) => {
  try {
    const { doctorId, date, timeSlot } = req.body;
    
    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if there's already an appointment for this doctor, date, and time slot
    const Appointment = (await import('../models/Appointment.js')).default;
    
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      timeSlot: timeSlot,
      status: { $in: ['booked', 'confirmed'] }
    });

    res.json({
      isBooked: !!existingAppointment,
      message: existingAppointment ? 'Slot is already booked' : 'Slot is available'
    });
  } catch (error) {
    console.error('Error checking slot availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new appointment
router.post('/', protect, createAppointment);

// Get patient's appointments
router.get('/', protect, getPatientAppointments);

// Get specific appointment
router.get('/:id', protect, getAppointmentById);

// Update appointment
router.put('/:id', protect, updateAppointment);

// Cancel appointment
router.delete('/:id', protect, cancelAppointment);

export default router;
