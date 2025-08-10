// controllers/prescriptionController.js
import Prescription from '../models/Prescription.js';
import User from '../models/User.js';

/* =================== PRESCRIPTION MANAGEMENT ====================== */

// POST /api/doctor/prescriptions
// Create a new prescription
export const createPrescription = async (req, res) => {
  try {
    const {
      patientId,
      diagnosis,
      symptoms,
      medications,
      notes,
      followUpDate,
      isEmergency
    } = req.body;

    // Validate required fields
    if (!patientId || !diagnosis || !medications || medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, diagnosis, and medications are required'
      });
    }

    // Validate patient exists and has patient role
    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Validate medications array
    for (let med of medications) {
      if (!med.medication || !med.dosage || !med.frequency || !med.duration || !med.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Each medication must have medication ID, dosage, frequency, duration, and quantity'
        });
      }
    }

    // Create prescription
    const prescription = await Prescription.create({
      patient: patientId,
      doctor: req.user.doctorId,
      diagnosis: diagnosis.trim(),
      symptoms: symptoms || [],
      medications,
      notes: notes ? notes.trim() : '',
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      isEmergency: isEmergency || false
    });

    // Populate medication details
    await prescription.populate([
      { path: 'medications.medication', select: 'name price quantity' },
      { path: 'patient', select: 'name email phoneNumber role' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription
    });

  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating prescription'
    });
  }
};

// GET /api/doctor/prescriptions
// Get all prescriptions by the logged-in doctor
export const getMyPrescriptions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      patientId,
      sortBy = 'prescriptionDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { doctor: req.user.doctorId };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (patientId) {
      filter.patient = patientId;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const prescriptions = await Prescription.find(filter)
      .populate('patient', 'name email phoneNumber role')
      .populate('medications.medication', 'name price quantity')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Prescription.countDocuments(filter);

    res.json({
      success: true,
      prescriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching prescriptions'
    });
  }
};

// GET /api/doctor/prescriptions/:id
// Get specific prescription details
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctor: req.user.doctorId
    }).populate([
      { path: 'patient', select: 'name email phoneNumber role' },
      { path: 'medications.medication', select: 'name price quantity' }
    ]);

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

  } catch (error) {
    console.error('Get prescription by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching prescription'
    });
  }
};

// PUT /api/doctor/prescriptions/:id
// Update prescription
export const updatePrescription = async (req, res) => {
  try {
    const {
      diagnosis,
      symptoms,
      medications,
      notes,
      followUpDate,
      isEmergency
    } = req.body;

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctor: req.user.doctorId,
      status: 'active' // Only allow updates to active prescriptions
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Active prescription not found'
      });
    }

    // Update fields if provided
    if (diagnosis) prescription.diagnosis = diagnosis.trim();
    if (symptoms) prescription.symptoms = symptoms;
    if (medications) prescription.medications = medications;
    if (notes !== undefined) prescription.notes = notes ? notes.trim() : '';
    if (followUpDate !== undefined) prescription.followUpDate = followUpDate ? new Date(followUpDate) : null;
    if (isEmergency !== undefined) prescription.isEmergency = isEmergency;

    await prescription.save();

    // Populate updated data
    await prescription.populate([
      { path: 'medications.medication', select: 'name price quantity' },
      { path: 'patient', select: 'name email phoneNumber role' }
    ]);

    res.json({
      success: true,
      message: 'Prescription updated successfully',
      prescription
    });

  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating prescription'
    });
  }
};

// DELETE /api/doctor/prescriptions/:id
// Cancel prescription (soft delete by changing status)
export const cancelPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctor: req.user.doctorId,
      status: 'active'
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Active prescription not found'
      });
    }

    prescription.status = 'cancelled';
    await prescription.save();

    res.json({
      success: true,
      message: 'Prescription cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling prescription'
    });
  }
};

// GET /api/doctor/patients/:id/prescriptions
// Get prescription history for a specific patient
export const getPatientPrescriptionHistory = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      status
    } = req.query;

    // Verify patient exists and has patient role
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Build filter
    const filter = { 
      patient: req.params.id,
      doctor: req.user.doctorId
    };
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const prescriptions = await Prescription.find(filter)
      .populate('medications.medication', 'name price quantity')
      .sort({ prescriptionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Prescription.countDocuments(filter);

    res.json({
      success: true,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phoneNumber: patient.phoneNumber
      },
      prescriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get patient prescription history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patient prescription history'
    });
  }
};
