import DoctorSchedule from '../models/DoctorSchedule.js';
import Doctor from '../models/Doctor.js';

// POST /api/doctor/schedule - Create or update weekly schedule
export const createOrUpdateSchedule = async (req, res) => {
  try {
    const { dayOfWeek, timeSlot, notes } = req.body;
    const doctorId = req.user._id;

    // Validate input
    if (!dayOfWeek || !Array.isArray(dayOfWeek) || dayOfWeek.length === 0) {
      return res.status(400).json({ message: 'Please select at least one day' });
    }

    if (!timeSlot || !['8-12', '12-4', '4-8', '20-00'].includes(timeSlot)) {
      return res.status(400).json({ message: 'Please select a valid time slot' });
    }

    // Validate day numbers
    for (const day of dayOfWeek) {
      if (![0, 1, 2, 3, 4, 5, 6].includes(day)) {
        return res.status(400).json({ message: 'Invalid day of week' });
      }
    }

    // Check if schedule already exists for this doctor and time slot
    let schedule = await DoctorSchedule.findOne({ 
      doctor: doctorId, 
      timeSlot: timeSlot 
    });

    if (schedule) {
      // Update existing schedule
      schedule.dayOfWeek = dayOfWeek;
      schedule.notes = notes || '';
      schedule.status = 'PENDING'; // Reset to pending for admin approval
      schedule.approvedBy = undefined;
      schedule.approvedAt = undefined;
    } else {
      // Create new schedule
      schedule = new DoctorSchedule({
        doctor: doctorId,
        dayOfWeek,
        timeSlot,
        notes: notes || ''
      });
    }

    await schedule.save();

    res.status(200).json({
      message: 'Schedule submitted successfully',
      schedule: {
        _id: schedule._id,
        dayOfWeek: schedule.dayOfWeek,
        timeSlot: schedule.timeSlot,
        status: schedule.status,
        notes: schedule.notes
      }
    });

  } catch (error) {
    console.error('Create/update schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/doctor/schedule - Get doctor's current schedule
export const getDoctorSchedule = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const schedules = await DoctorSchedule.find({ doctor: doctorId })
      .sort({ timeSlot: 1 });

    res.json({
      schedules: schedules.map(schedule => ({
        _id: schedule._id,
        dayOfWeek: schedule.dayOfWeek,
        timeSlot: schedule.timeSlot,
        status: schedule.status,
        notes: schedule.notes,
        createdAt: schedule.createdAt,
        updatedAt: schedule.updatedAt
      }))
    });

  } catch (error) {
    console.error('Get doctor schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/doctor/schedule/:id - Delete a schedule
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user._id;

    const schedule = await DoctorSchedule.findOne({ _id: id, doctor: doctorId });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    await schedule.deleteOne();

    res.json({ message: 'Schedule deleted successfully' });

  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/doctor/schedule/available - Get available days for a time slot
export const getAvailableDays = async (req, res) => {
  try {
    const { timeSlot } = req.query;
    const doctorId = req.user._id;

    if (!timeSlot || !['8-12', '12-4', '4-8', '20-00'].includes(timeSlot)) {
      return res.status(400).json({ message: 'Valid time slot required' });
    }

    // Check if doctor already has a schedule for this time slot
    const existingSchedule = await DoctorSchedule.findOne({ 
      doctor: doctorId, 
      timeSlot: timeSlot 
    });

    if (existingSchedule) {
      return res.json({
        hasSchedule: true,
        currentDays: existingSchedule.dayOfWeek,
        status: existingSchedule.status
      });
    }

    // Return all days as available
    res.json({
      hasSchedule: false,
      availableDays: [0, 1, 2, 3, 4, 5, 6]
    });

  } catch (error) {
    console.error('Get available days error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};








