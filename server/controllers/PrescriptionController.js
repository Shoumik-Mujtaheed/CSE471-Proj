import Prescription from '../models/Prescription.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js'; 
import Inventory from '../models/Inventory.js';
import { generateInvoiceForPrescription } from './InvoiceController.js';
import { updateAppointmentStatus } from './AppointmentController.js';
import { bulkDeductMedicines } from './InventoryController.js';

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create prescription (automatically generates invoice and completes appointment)
export const createPrescription = async (req, res) => {
  const { patient, doctor, disease, prescribedMedicines, referredDoctor, referredDoctorName, appointment } = req.body;
  
  try {
    //  Find doctor profile by doctor ID (not user ID)
    const doctorProfile = await Doctor.findById(doctor);
    if (!doctorProfile) {
      return res.status(400).json({ message: 'Valid doctor not found' });
    }

    // Validate patient exists
    const patientUser = await User.findOne({ _id: patient, role: 'patient' });
    if (!patientUser) return res.status(400).json({ message: 'Valid patient not found' });

    // Process medicines and get current prices from inventory
    const processedMedicines = [];
    let totalAmount = 0;

    for (const med of prescribedMedicines) {
      const inventoryItem = await Inventory.findById(med.medicineId);
      if (!inventoryItem) {
        return res.status(400).json({ 
          message: `Medicine with ID ${med.medicineId} not found in inventory` 
        });
      }

      const medicineTotal = inventoryItem.price * med.quantity;
      processedMedicines.push({
        medicineId: inventoryItem._id,
        medicineName: inventoryItem.name,
        quantity: med.quantity,
        price: inventoryItem.price,
        instructions: med.instructions || '',
        total: medicineTotal
      });
      totalAmount += medicineTotal;
    }

    // Create prescription using the validated doctor ID
    const prescription = new Prescription({
      patient,
      doctor, // This is already the doctor ID from Doctor collection
      disease,
      prescribedMedicines: processedMedicines,
      totalAmount,
      referredDoctor: referredDoctor || undefined,
      referredDoctorName: referredDoctorName || undefined
    });

    await prescription.save();
    //  Deduct medicines from inventory after prescription is saved
    try {
      const stockResult = await bulkDeductMedicines(processedMedicines);
      if (stockResult.errors.length > 0) {
        console.warn('Some medicines could not be deducted from stock:', stockResult.errors);
      }
      console.log('Stock updated successfully:', stockResult.updatedMedicines);
    } catch (stockError) {
      console.error('Error updating inventory stock:', stockError);
      // Note: We don't fail the prescription creation if stock update fails
    }

    //  Mark the appointment as completed if appointment ID is provided
    if (appointment) {
      try {
        await updateAppointmentStatus(appointment, 'completed');
        console.log(`Appointment ${appointment} marked as completed`);
      } catch (appointmentError) {
        console.error('Failed to update appointment status:', appointmentError);
        // Don't fail the prescription creation if appointment update fails
      }
    }
    
    // Automatically generate invoice
    const invoice = await generateInvoiceForPrescription(prescription);

    res.status(201).json({
      prescription,
      invoice: invoice._id,
      message: 'Prescription created successfully and appointment completed'
    });
  } catch (err) {
    console.error('Create prescription error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get all prescriptions
export const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('patient', 'name email phoneNumber')
      .populate('doctor', 'name email')
      .populate('prescribedMedicines.medicineId', 'name price quantity')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get prescriptions by patient ID
export const getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const prescriptions = await Prescription.find({ patient: patientId })
      .populate('patient', 'name email phoneNumber')
      .populate('doctor', 'name email')
      .populate('prescribedMedicines.medicineId', 'name price quantity')
      .sort({ createdAt: -1 });
    
    res.json({ prescriptions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get prescriptions by doctor
export const getMyPrescriptions = async (req, res) => {
  try {
    // Find doctor profile from authenticated user
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid doctor not found' 
      });
    }

    const prescriptions = await Prescription.find({ doctor: doctorProfile._id })
      .populate('patient', 'name email phoneNumber')
      .populate('prescribedMedicines.medicineId', 'name price quantity')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      prescriptions
    });
  } catch (err) {
    console.error('Get my prescriptions error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get prescription by ID
export const getPrescriptionById = async (req, res) => {
  try {
    //  Find doctor profile from authenticated user
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(400).json({
        success: false,
        message: 'Valid doctor not found'
      });
    }

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctor: doctorProfile._id
    })
      .populate('patient', 'name email phoneNumber')
      .populate('prescribedMedicines.medicineId', 'name price quantity');
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    res.json({
      success: true,
      prescription
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update prescription
export const updatePrescription = async (req, res) => {
  try {
    //  Find doctor profile from authenticated user
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(400).json({
        success: false,
        message: 'Valid doctor not found'
      });
    }

    const prescription = await Prescription.findOneAndUpdate(
      { _id: req.params.id, doctor: doctorProfile._id },
      req.body,
      { new: true }
    )
      .populate('patient', 'name email phoneNumber')
      .populate('prescribedMedicines.medicineId', 'name price quantity');
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Prescription updated successfully',
      prescription
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Cancel prescription
export const cancelPrescription = async (req, res) => {
  try {
    //  Find doctor profile from authenticated user
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(400).json({
        success: false,
        message: 'Valid doctor not found'
      });
    }

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctor: doctorProfile._id
    });
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Update status or delete based on your business logic
    prescription.status = 'cancelled';
    await prescription.save();
    
    res.json({
      success: true,
      message: 'Prescription cancelled successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get patient prescription history
export const getPatientPrescriptionHistory = async (req, res) => {
  try {
    //  Find doctor profile from authenticated user
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(400).json({
        success: false,
        message: 'Valid doctor not found'
      });
    }

    const prescriptions = await Prescription.find({ 
      patient: req.params.id,
      doctor: doctorProfile._id 
    })
      .populate('prescribedMedicines.medicineId', 'name price quantity')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      prescriptions
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};
