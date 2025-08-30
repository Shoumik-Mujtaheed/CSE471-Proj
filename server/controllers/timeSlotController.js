import TimeSlot from '../models/TimeSlot.js';
import Doctor from '../models/Doctor.js';

// GET /api/time-slots - Get all time slots (admin view)
export const getAllTimeSlots = async (req, res) => {
  try {
    console.log('🔍 getAllTimeSlots: Starting function...');
    console.log('🔍 getAllTimeSlots: User from request:', req.user);
    
    const timeSlots = await TimeSlot.find();
    console.log('🔍 getAllTimeSlots: Found time slots:', timeSlots.length);
    
    const populatedTimeSlots = await TimeSlot.find()
      .populate('assignedTo', 'specialty')
      .populate({
        path: 'assignedTo',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('approvedBy', 'name')
      .sort({ dayOfWeek: 1, timeSlot: 1 });
    
    console.log('🔍 getAllTimeSlots: Populated time slots:', populatedTimeSlots.length);

    res.json({
      timeSlots: populatedTimeSlots,
      count: populatedTimeSlots.length,
      summary: {
        available: populatedTimeSlots.filter(slot => slot.status === 'AVAILABLE').length,
        pending: populatedTimeSlots.filter(slot => slot.status === 'PENDING').length,
        assigned: populatedTimeSlots.filter(slot => slot.status === 'ASSIGNED').length,
        unavailable: populatedTimeSlots.filter(slot => slot.status === 'UNAVAILABLE').length,
        booked: populatedTimeSlots.filter(slot => slot.status === 'BOOKED').length
      }
    });
    
    console.log('✅ getAllTimeSlots: Successfully sent response');
  } catch (error) {
    console.error('❌ getAllTimeSlots: Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/time-slots/available - Get available time slots for patients
export const getAvailableTimeSlots = async (req, res) => {
  try {
    // Show ASSIGNED slots (approved by admin) that have a valid doctor assigned
    // Remove the hasAppointment check since it's not used in the new system
    const availableSlots = await TimeSlot.find({
      status: 'ASSIGNED',
      assignedTo: { $exists: true, $ne: null } // Must have a doctor assigned
    })
    .populate('assignedTo', 'specialty')
    .populate({
      path: 'assignedTo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .sort({ dayOfWeek: 1, timeSlot: 1 });

    // Clean up the response to show only essential info
    const cleanSlots = availableSlots.map(slot => ({
      id: slot._id,
      dayOfWeek: slot.dayOfWeek,
      timeSlot: slot.timeSlot,
      dayName: getDayName(slot.dayOfWeek),
      doctor: {
        id: slot.assignedTo._id,
        name: slot.assignedTo.user.name,
        email: slot.assignedTo.user.email,
        specialty: slot.assignedTo.specialty
      }
    }));

    res.json({
      availableSlots: cleanSlots,
      count: cleanSlots.length
    });
  } catch (error) {
    console.error('Get available time slots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/time-slots/request - Doctor requests time slots for multiple days
export const requestTimeSlot = async (req, res) => {
  try {
    const { dayOfWeek, timeSlot, notes } = req.body;
    const userId = req.user._id;

    if (!dayOfWeek || !Array.isArray(dayOfWeek) || dayOfWeek.length === 0 || !timeSlot) {
      return res.status(400).json({ message: 'Days array and time slot are required' });
    }

    // Validate each day
    for (const day of dayOfWeek) {
      if (day < 0 || day > 6) {
        return res.status(400).json({ message: 'Invalid day of week (0-6)' });
      }
    }

    if (!['8-12', '12-4', '4-8', '20-00'].includes(timeSlot)) {
      return res.status(400).json({ message: 'Invalid time slot' });
    }

    // Find the doctor profile for this user
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const doctorId = doctor._id;
    const results = [];
    const errors = [];

    // Process each selected day
    for (const day of dayOfWeek) {
      try {
        // Find the time slot for this day and time
        const timeSlotDoc = await TimeSlot.findOne({ dayOfWeek: day, timeSlot });
        if (!timeSlotDoc) {
          errors.push(`Time slot not found for ${getDayName(day)} ${timeSlot}`);
          continue;
        }

        if (timeSlotDoc.status !== 'AVAILABLE') {
          errors.push(`${getDayName(day)} ${timeSlot} is not available for assignment`);
          continue;
        }

        // Check if doctor already has a slot at this specific day and time
        const existingSlot = await TimeSlot.findOne({
          assignedTo: doctorId,
          dayOfWeek: day,
          timeSlot: timeSlot
        });

        if (existingSlot) {
          errors.push(`You already have a slot for ${getDayName(day)} ${timeSlot}`);
          continue;
        }

        // Request the slot (status becomes PENDING)
        timeSlotDoc.status = 'PENDING';
        timeSlotDoc.assignedTo = doctorId;
        timeSlotDoc.assignedAt = new Date();
        timeSlotDoc.notes = notes || '';

        await timeSlotDoc.save();

        results.push({
          dayOfWeek: day,
          dayName: getDayName(day),
          timeSlot: timeSlot,
          status: 'PENDING',
          notes: notes || ''
        });

      } catch (error) {
        errors.push(`Error processing ${getDayName(day)} ${timeSlot}: ${error.message}`);
      }
    }

    if (results.length === 0) {
      return res.status(400).json({ 
        message: 'No time slots could be requested',
        errors: errors
      });
    }

    res.json({
      message: `Successfully requested ${results.length} time slot(s) (pending admin approval)`,
      requestedSlots: results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Request time slot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/time-slots/:id/approve - Admin approves time slot request
export const approveTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const timeSlot = await TimeSlot.findById(id);
    if (!timeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }

    if (timeSlot.status !== 'PENDING') {
      return res.status(400).json({ message: 'Time slot is not in pending status' });
    }

    // Update the time slot status to ASSIGNED and approval info
    timeSlot.status = 'ASSIGNED';
    timeSlot.approvedBy = adminId;
    timeSlot.approvedAt = new Date();
    // Keep the assignedTo field (don't change it)
    await timeSlot.save();

    // Add this approved time slot to the doctor's appointmentTimes array
    const doctor = await Doctor.findById(timeSlot.assignedTo);
    if (doctor) {
      const newAppointmentTime = {
        dayOfWeek: timeSlot.dayOfWeek,
        timeSlot: timeSlot.timeSlot,
        timeSlotId: timeSlot._id,
        approvedAt: timeSlot.approvedAt
      };

      // Check if this time slot is already in the array
      const exists = doctor.appointmentTimes.some(
        at => at.dayOfWeek === timeSlot.dayOfWeek && at.timeSlot === timeSlot.timeSlot
      );

      if (!exists) {
        doctor.appointmentTimes.push(newAppointmentTime);
        await doctor.save();
      }
    }

    res.json({
      message: 'Time slot approved successfully',
      timeSlot: {
        _id: timeSlot._id,
        status: timeSlot.status,
        assignedTo: timeSlot.assignedTo,
        approvedBy: timeSlot.approvedBy,
        approvedAt: timeSlot.approvedAt
      },
      doctorUpdated: !!doctor
    });

  } catch (error) {
    console.error('Approve time slot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/time-slots/:id/reject - Admin rejects time slot request
export const rejectTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const timeSlot = await TimeSlot.findById(id);
    if (!timeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }

    if (timeSlot.status !== 'PENDING') {
      return res.status(400).json({ message: 'Time slot is not in pending status' });
    }

    // Reset the slot to available
    timeSlot.status = 'AVAILABLE';
    timeSlot.assignedTo = null;
    timeSlot.assignedAt = null;
    timeSlot.notes = reason || 'Rejected by admin';
    await timeSlot.save();

    res.json({
      message: 'Time slot rejected and reset to available',
      timeSlot: {
        _id: timeSlot._id,
        status: timeSlot.status,
        notes: timeSlot.notes
      }
    });

  } catch (error) {
    console.error('Reject time slot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/time-slots/doctor/:doctorId - Get time slots assigned to a specific doctor
export const getDoctorTimeSlots = async (req, res) => {
  try {
    let doctorId = req.params.doctorId;
    
    // If the route is /me, get the current doctor's ID from the user
    if (doctorId === 'me') {
      const userId = req.user._id;
      const doctor = await Doctor.findOne({ user: userId });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      doctorId = doctor._id;
    }

    const timeSlots = await TimeSlot.find({ assignedTo: doctorId })
      .populate('assignedTo', 'specialty')
      .populate('approvedBy', 'name')
      .sort({ dayOfWeek: 1, timeSlot: 1 });

    res.json({
      timeSlots,
      count: timeSlots.length
    });

  } catch (error) {
    console.error('Get doctor time slots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/time-slots/doctor/:doctorId/available - Get doctor's available appointment times
export const getDoctorAvailableTimes = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId)
      .populate('user', 'name email specialty');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Get available times from the central TimeSlot system (ASSIGNED slots)
    const availableSlots = await TimeSlot.find({
      assignedTo: doctorId,
      status: 'ASSIGNED'
    }).sort({ dayOfWeek: 1, timeSlot: 1 });

    const availableTimes = availableSlots.map(slot => ({
      dayOfWeek: slot.dayOfWeek,
      timeSlot: slot.timeSlot,
      dayName: getDayName(slot.dayOfWeek),
      approvedAt: slot.approvedAt
    }));

    res.json({
      doctor: {
        id: doctor._id,
        name: doctor.user.name,
        email: doctor.user.email,
        specialty: doctor.user.specialty || doctor.specialty
      },
      availableTimes,
      count: availableTimes.length
    });

  } catch (error) {
    console.error('Get doctor available times error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to get day name
const getDayName = (dayNumber) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber];
};
