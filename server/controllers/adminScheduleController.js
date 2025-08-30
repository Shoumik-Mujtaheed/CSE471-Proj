import DoctorSchedule from '../models/DoctorSchedule.js';
import Doctor from '../models/Doctor.js';

// GET /api/admin/schedules - Get all doctor schedules for admin review
export const getAllSchedules = async (req, res) => {
  try {
    console.log('🔍 Fetching all doctor schedules...');
    
    // First, let's see what's in the database without populate
    const rawSchedules = await DoctorSchedule.find().lean();
    console.log(`📊 Raw database query found ${rawSchedules.length} schedules:`, JSON.stringify(rawSchedules, null, 2));
    
    const schedules = await DoctorSchedule.find()
      .populate('doctor', 'specialty')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${schedules.length} schedules in database`);
    console.log('📋 Raw schedules:', JSON.stringify(schedules, null, 2));

    // Safely map schedules with better error handling
    const safeSchedules = schedules.map((schedule, index) => {
      console.log(`🔍 Processing schedule ${index + 1}:`, schedule._id);
      
      try {
        // Check if schedule exists
        if (!schedule) {
          console.log(`❌ Schedule ${index + 1} is null`);
          return null;
        }

        // Check if doctor exists
        if (!schedule.doctor) {
          console.log(`❌ Schedule ${index + 1} has no doctor:`, schedule);
          return null;
        }

        // Check if doctor.user exists
        if (!schedule.doctor.user) {
          console.log(`❌ Schedule ${index + 1} doctor has no user:`, schedule.doctor);
          return null;
        }

        const mappedSchedule = {
          _id: schedule._id,
          doctor: {
            _id: schedule.doctor._id,
            name: schedule.doctor.user.name || 'Unknown',
            email: schedule.doctor.user.email || 'Unknown',
            specialty: schedule.doctor.specialty || 'Unknown'
          },
          dayOfWeek: schedule.dayOfWeek || [],
          timeSlot: schedule.timeSlot || 'Unknown',
          status: schedule.status || 'UNKNOWN',
          notes: schedule.notes || '',
          approvedBy: schedule.approvedBy?.name || null,
          approvedAt: schedule.approvedAt || null,
          createdAt: schedule.createdAt || new Date(),
          updatedAt: schedule.updatedAt || new Date()
        };

        console.log(`✅ Successfully mapped schedule ${index + 1}:`, mappedSchedule._id);
        return mappedSchedule;

      } catch (error) {
        console.error(`❌ Error processing schedule ${index + 1}:`, error);
        return null;
      }
    }).filter(schedule => schedule !== null);

    console.log(`✅ Final result: ${safeSchedules.length} valid schedules`);

    res.json({
      schedules: safeSchedules,
      count: safeSchedules.length,
      debug: {
        totalFound: schedules.length,
        validSchedules: safeSchedules.length,
        rawSchedules: schedules.map(s => ({
          _id: s._id,
          doctorId: s.doctor?._id,
          hasUser: !!s.doctor?.user,
          status: s.status
        })),
        databaseRaw: rawSchedules
      }
    });

  } catch (error) {
    console.error('❌ Get all schedules error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// PATCH /api/admin/schedules/:id/approve - Approve a doctor schedule
export const approveSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const schedule = await DoctorSchedule.findById(id);
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (schedule.status === 'APPROVED') {
      return res.status(400).json({ message: 'Schedule is already approved' });
    }

    schedule.status = 'APPROVED';
    schedule.approvedBy = adminId;
    schedule.approvedAt = new Date();

    await schedule.save();

    res.json({
      message: 'Schedule approved successfully',
      schedule: {
        _id: schedule._id,
        status: schedule.status,
        approvedBy: schedule.approvedBy,
        approvedAt: schedule.approvedAt
      }
    });

  } catch (error) {
    console.error('Approve schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/admin/schedules/:id/reject - Reject a doctor schedule
export const rejectSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const schedule = await DoctorSchedule.findById(id);
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    schedule.status = 'REJECTED';
    schedule.notes = reason || 'Rejected by admin';

    await schedule.save();

    res.json({
      message: 'Schedule rejected successfully',
      schedule: {
        _id: schedule._id,
        status: schedule.status,
        notes: schedule.notes
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/schedules/pending - Get pending schedules count
export const getPendingSchedulesCount = async (req, res) => {
  try {
    const count = await DoctorSchedule.countDocuments({ status: 'PENDING' });
    
    res.json({ pendingCount: count });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/schedules/overview - Get schedule overview for admin dashboard
export const getScheduleOverview = async (req, res) => {
  try {
    const [pending, approved, rejected] = await Promise.all([
      DoctorSchedule.countDocuments({ status: 'PENDING' }),
      DoctorSchedule.countDocuments({ status: 'APPROVED' }),
      DoctorSchedule.countDocuments({ status: 'REJECTED' })
    ]);

    res.json({
      overview: {
        pending: pending || 0,
        approved: approved || 0,
        rejected: rejected || 0,
        total: (pending || 0) + (approved || 0) + (rejected || 0)
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};







