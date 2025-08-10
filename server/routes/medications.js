// routes/medications.js
import express from 'express';
import {
  searchMedications,
  getAllMedications,
  getMedicationById
} from '../controllers/medicationController.js';

const router = express.Router();

/* =================== MEDICATION ROUTES ====================== */

// Search medications with auto-suggestions
router.get('/search', searchMedications);

// Get all medications with filters and pagination
router.get('/', getAllMedications);

// Get specific medication details
router.get('/:id', getMedicationById);

export default router;
