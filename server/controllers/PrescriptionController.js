import Prescription from '../models/Prescription.js';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import { generateInvoiceForPrescription } from './InvoiceController.js';

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

// Create prescription (automatically generates invoice)
export const createPrescription = async (req, res) => {
  const { patient, doctor, disease, prescribedMedicines, referredDoctor, referredDoctorName } = req.body;
  
  try {
    // Validate patient and doctor exist with correct roles
    const patientUser = await User.findOne({ _id: patient, role: 'patient' });
    const doctorUser = await User.findOne({ _id: doctor, role: 'doctor' });
    
    if (!patientUser) return res.status(400).json({ message: 'Valid patient not found' });
    if (!doctorUser) return res.status(400).json({ message: 'Valid doctor not found' });

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

    // Create prescription
    const prescription = new Prescription({
      patient,
      doctor,
      disease,
      prescribedMedicines: processedMedicines,
      totalAmount,
      referredDoctor: referredDoctor || undefined,
      referredDoctorName: referredDoctorName || undefined
    });

    await prescription.save();
    
    // Automatically generate invoice
    const invoice = await generateInvoiceForPrescription(prescription);

    res.status(201).json({
      prescription,
      invoice: invoice._id, // Return invoice ID for reference
      message: 'Prescription created and invoice generated successfully'
    });
  } catch (err) {
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

// Get prescriptions by doctor
export const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctor: req.user.doctorId })
      .populate('patient', 'name email phoneNumber')
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

// Get prescription by ID
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctor: req.user.doctorId
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
    const prescription = await Prescription.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user.doctorId },
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
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctor: req.user.doctorId
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
    const prescriptions = await Prescription.find({ 
      patient: req.params.id,
      doctor: req.user.doctorId 
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