// server/controllers/doctorController.js
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Inventory from '../models/Inventory.js';
import { generateInvoiceForPrescription } from './InvoiceController.js';

/* =================== DOCTOR PROFILE MANAGEMENT ====================== */

// GET /api/doctor/profile
export const getDoctorProfile = async (req, res) => {
  try {
    // req.user is set by userAuth middleware and contains the full user object
    const doctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'name email phoneNumber');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json({
      id: doctor._id,
      name: doctor.user.name,
      email: doctor.user.email,
      phoneNumber: doctor.user.phoneNumber,
      specialty: doctor.specialty,
      appointmentTimes: doctor.appointmentTimes
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/doctor/profile
// Create or update doctor profile with specialty and appointment times
export const updateDoctorProfile = async (req, res) => {
  try {
    const { specialty, appointmentTimes } = req.body;

    if (!specialty) {
      return res.status(400).json({ message: 'Specialty is required' });
    }

    // Validate appointmentTimes structure if provided
    if (appointmentTimes && Array.isArray(appointmentTimes)) {
      const validDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
      for (const slot of appointmentTimes) {
        if (!slot.dayOfWeek || !slot.startTime || !slot.endTime) {
          return res.status(400).json({ 
            message: 'Each appointment time must have dayOfWeek, startTime, and endTime' 
          });
        }
        
        if (!validDays.includes(slot.dayOfWeek)) {
          return res.status(400).json({ 
            message: `Invalid day: ${slot.dayOfWeek}. Must be one of: ${validDays.join(', ')}` 
          });
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
          return res.status(400).json({ 
            message: 'Time must be in HH:MM format (24-hour)' 
          });
        }

        // Check if start time is before end time
        const [startHour, startMin] = slot.startTime.split(':').map(Number);
        const [endHour, endMin] = slot.endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        if (startMinutes >= endMinutes) {
          return res.status(400).json({ 
            message: `Start time must be before end time for ${slot.dayOfWeek}` 
          });
        }
      }
    }

    // Find existing doctor profile or create new one
    let doctor = await Doctor.findOne({ user: req.user._id });
    
    if (doctor) {
      // Update existing profile
      doctor.specialty = specialty;
      if (appointmentTimes) {
        doctor.appointmentTimes = appointmentTimes;
      }
      await doctor.save();
    } else {
      // Create new doctor profile
      doctor = await Doctor.create({
        user: req.user._id,
        specialty,
        appointmentTimes: appointmentTimes || []
      });
    }

    // Populate and return updated profile
    await doctor.populate('user', 'name email phoneNumber');
    
    res.json({
      id: doctor._id,
      name: doctor.user.name,
      email: doctor.user.email,
      phoneNumber: doctor.user.phoneNumber,
      specialty: doctor.specialty,
      appointmentTimes: doctor.appointmentTimes
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/doctor/appointment-times
// Update only the appointment times for a doctor
export const updateAppointmentTimes = async (req, res) => {
  try {
    const { appointmentTimes } = req.body;

    if (!appointmentTimes || !Array.isArray(appointmentTimes)) {
      return res.status(400).json({ message: 'appointmentTimes array is required' });
    }

    const validDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    // Validate appointment times
    for (const slot of appointmentTimes) {
      if (!slot.dayOfWeek || !slot.startTime || !slot.endTime) {
        return res.status(400).json({ 
          message: 'Each appointment time must have dayOfWeek, startTime, and endTime' 
        });
      }
      
      if (!validDays.includes(slot.dayOfWeek)) {
        return res.status(400).json({ 
          message: `Invalid day: ${slot.dayOfWeek}` 
        });
      }

      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
        return res.status(400).json({ 
          message: 'Time must be in HH:MM format (24-hour)' 
        });
      }

      // Check time logic
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (startMinutes >= endMinutes) {
        return res.status(400).json({ 
          message: `Start time must be before end time for ${slot.dayOfWeek}` 
        });
      }
    }

    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      { appointmentTimes },
      { new: true }
    ).populate('user', 'name email phoneNumber');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json({
      message: 'Appointment times updated successfully',
      appointmentTimes: doctor.appointmentTimes
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/doctor/specialty-options
// Get list of available specialties (you can expand this list)
export const getSpecialtyOptions = async (req, res) => {
  try {
    const specialties = [
      'General Medicine',
      'Cardiology',
      'Dermatology',
      'Endocrinology',
      'Gastroenterology',
      'Neurology',
      'Orthopedics',
      'Pediatrics',
      'Psychiatry',
      'Radiology',
      'Surgery',
      'Urology',
      'Ophthalmology',
      'ENT (Ear, Nose, Throat)',
      'Gynecology',
      'Oncology'
    ];
    
    res.json(specialties);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =================== APPOINTMENT MANAGEMENT ====================== */

// GET /api/doctor/appointments
// Get all appointments for this doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    // First get the doctor document
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Find appointments for this doctor and populate patient info
    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate('user', 'name email phoneNumber')
      .populate('doctor', 'specialty')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json(appointments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/doctor/appointments/pending
// Get pending appointments for this doctor
export const getDoctorPendingAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ 
      doctor: doctor._id,
      status: 'pending'
    })
      .populate('user', 'name email phoneNumber')
      .populate('doctor', 'specialty')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json(appointments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/doctor/appointments/:id/status
// Update appointment status (accept, reject, complete)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Get doctor profile
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Find and update appointment
    const appointment = await Appointment.findOneAndUpdate(
      { 
        _id: req.params.id,
        doctor: doctor._id  // Ensure doctor can only update their own appointments
      },
      { status },
      { new: true }
    ).populate('user', 'name email phoneNumber');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({
      message: `Appointment ${status} successfully`,
      appointment
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =================== PRESCRIPTION MANAGEMENT ====================== */

// POST /api/doctor/appointments/:id/prescription
// Create a prescription for a specific appointment (Updated to match your Prescription model)
export const createPrescription = async (req, res) => {
  try {
    const { prescribedMedicines, disease, instructions, notes } = req.body;

    if (!prescribedMedicines || !Array.isArray(prescribedMedicines) || prescribedMedicines.length === 0) {
      return res.status(400).json({ message: 'At least one prescribed medicine is required' });
    }

    if (!disease) {
      return res.status(400).json({ message: 'Disease/diagnosis is required' });
    }

    // Validate prescribed medicines structure and calculate totals
    let totalAmount = 0;
    const processedMedicines = [];

    for (const med of prescribedMedicines) {
      if (!med.medicineId || !med.medicineName || !med.quantity || !med.price) {
        return res.status(400).json({ 
          message: 'Each medicine must have medicineId, medicineName, quantity, and price' 
        });
      }

      // Verify medicine exists in inventory
      const inventoryItem = await Inventory.findById(med.medicineId);
      if (!inventoryItem) {
        return res.status(404).json({ 
          message: `Medicine ${med.medicineName} not found in inventory` 
        });
      }

      // Check availability
      if (inventoryItem.quantity < med.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${med.medicineName}. Available: ${inventoryItem.quantity}, Requested: ${med.quantity}` 
        });
      }

      const total = med.quantity * med.price;
      processedMedicines.push({
        medicineId: med.medicineId,
        medicineName: med.medicineName,
        quantity: med.quantity,
        price: med.price,
        instructions: med.instructions || '',
        total: total
      });

      totalAmount += total;
    }

    // Get doctor profile
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Verify appointment exists and belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctor._id
    }).populate('user', 'name email phoneNumber');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Create prescription with your model structure
    const prescription = await Prescription.create({
      patient: appointment.user._id,
      doctor: req.user._id, // Reference to User, not Doctor
      disease: disease.trim(),
      prescribedMedicines: processedMedicines,
      totalAmount,
      status: 'active'
    });

    // Generate invoice automatically after prescription creation
    try {
      const invoice = await generateInvoiceForPrescription(prescription._id);
      console.log(`Invoice ${invoice.invoiceNumber} generated for prescription ${prescription._id}`);
    } catch (invoiceError) {
      console.error('Failed to generate invoice:', invoiceError.message);
      // Don't fail the prescription creation if invoice generation fails
    }

    // Update appointment status to completed
    if (appointment.status === 'confirmed') {
      appointment.status = 'completed';
      await appointment.save();
    }

    // Populate and return prescription
    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('patient', 'name email phoneNumber')
      .populate('doctor', 'name email')
      .populate('prescribedMedicines.medicineId', 'name category');

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription: populatedPrescription
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/doctor/prescriptions
// Get all prescriptions written by this doctor
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Updated to work with your Prescription model structure
    const prescriptions = await Prescription.find({ doctor: req.user._id })
      .populate('patient', 'name email phoneNumber')
      .populate('doctor', 'name email')
      .populate('prescribedMedicines.medicineId', 'name category')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/doctor/prescriptions/:id
// Get specific prescription details
export const getPrescriptionDetails = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctor: req.user._id // Updated to use req.user._id since doctor field references User
    })
      .populate('patient', 'name email phoneNumber bloodGroup')
      .populate('doctor', 'name email')
      .populate('prescribedMedicines.medicineId', 'name category price');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/doctor/prescriptions/:id
// Update a prescription (only if not older than 24 hours)
export const updatePrescription = async (req, res) => {
  try {
    const { prescribedMedicines, disease, instructions, notes } = req.body;

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctor: req.user._id // Updated to use req.user._id
    });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check if prescription is older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (prescription.createdAt < twentyFourHoursAgo) {
      return res.status(400).json({ 
        message: 'Cannot edit prescriptions older than 24 hours' 
      });
    }

    // Update fields
    if (prescribedMedicines) {
      // Recalculate total if medicines are updated
      let newTotalAmount = 0;
      for (const med of prescribedMedicines) {
        newTotalAmount += med.total || (med.quantity * med.price);
      }
      prescription.prescribedMedicines = prescribedMedicines;
      prescription.totalAmount = newTotalAmount;
    }
    if (disease) prescription.disease = disease;
    
    await prescription.save();

    // Return updated prescription
    const updatedPrescription = await Prescription.findById(prescription._id)
      .populate('patient', 'name email phoneNumber')
      .populate('doctor', 'name email')
      .populate('prescribedMedicines.medicineId', 'name category');

    res.json({
      message: 'Prescription updated successfully',
      prescription: updatedPrescription
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
