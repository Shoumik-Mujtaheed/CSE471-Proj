// controllers/triageController.js
// Smart Symptom Search → Specialist → Bookable Doctors (Rule-Based)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callGemini } from '../utils/geminiApi.js';

// // Fallback API key if not in environment
// if (!process.env.GEMINI_API_KEY) {
//   process.env.GEMINI_API_KEY = 'AIzaSyBvtrWPrXhKPsuxir_axjt6unVY7_1lVJY';
// }

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration files
const loadConfig = (filename) => {
  try {
    const configPath = path.join(__dirname, '../config/triage', filename);
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading config ${filename}:`, error);
    return {};
  }
};

const SYMPTOMS = loadConfig('symptoms.json');
const SYNONYMS = loadConfig('synonyms.json');
const SYMPTOM_WEIGHTS = loadConfig('symptom_weights.json');
const SYMPTOM_SPECIALTY_MATRIX = loadConfig('symptom_specialty_matrix.json');

const handleUnknownSymptoms = async (symptoms) => {
  const unknownSymptoms = symptoms.filter(symptom => 
    !SYMPTOMS.map(s => s.toLowerCase()).includes(symptom.toLowerCase())
  );
  
  if (unknownSymptoms.length === 0) return null;
  
  const prompt = `What medical specialty handles these symptoms: ${unknownSymptoms.join(', ')}? Answer with just the specialty name.`;
  const geminiResult = await callGemini(prompt);
  
  return geminiResult ? {
    specialty: geminiResult,
    symptoms: unknownSymptoms
  } : null;
};

// GET /api/triage/symptoms
// Get symptom suggestions (max 5) based on prefix
export const getSymptomSuggestions = async (req, res) => {
  try {
    const { query = '' } = req.query;
    
    if (!query || query.length < 2) {
      return res.json([]);
    }

    const normalizedQuery = query.toLowerCase().trim();
    const suggestions = SYMPTOMS
      .filter(symptom => symptom.toLowerCase().includes(normalizedQuery))
      .slice(0, 5); // Max 5 suggestions

    res.json(suggestions);
  } catch (error) {
    console.error('Error getting symptom suggestions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/triage/search
// Analyze symptoms and recommend specialty + doctors
export const searchBySymptoms = async (req, res) => {
  try {
    const { symptoms = [], date = new Date().toISOString().split('T')[0] } = req.body;
    
    if (!symptoms.length) {
      return res.status(400).json({ message: 'Please select at least one symptom' });
    }

    // Normalize and map symptoms to canonical form
    const normalizedSymptoms = symptoms.map(symptom => {
      const normalized = symptom.toLowerCase().trim();
      return SYNONYMS[normalized] || normalized;
    });

    // Check for unknown symptoms and get Gemini suggestion
    const unknownSymptomResult = await handleUnknownSymptoms(normalizedSymptoms);

    // Calculate specialty scores
    const specialtyScores = {};
    
    // Base scoring from symptom-specialty matrix
    normalizedSymptoms.forEach(symptom => {
      const weights = SYMPTOM_WEIGHTS[symptom] || 1.0;
      const matrix = SYMPTOM_SPECIALTY_MATRIX[symptom] || {};
      
      Object.entries(matrix).forEach(([specialty, score]) => {
        specialtyScores[specialty] = (specialtyScores[specialty] || 0) + (weights * score);
      });
    });



    // Rank specialties (threshold: 0.35)
    const rankedSpecialties = Object.entries(specialtyScores)
      .filter(([_, score]) => score >= 0.35)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 2); // Top 2 specialties

    // Use Gemini result if unknown symptoms found and rule-based confidence is low
    if (unknownSymptomResult && (rankedSpecialties.length === 0 || rankedSpecialties[0][1] < 0.4)) {
      rankedSpecialties.unshift([unknownSymptomResult.specialty, 0.8]);
    }

    // Fallback to General Medicine if no specialty passes threshold
    if (rankedSpecialties.length === 0) {
      rankedSpecialties.push(['General Medicine', 0.5]);
    }

    // Get recommended doctors for top specialty
    const topSpecialty = rankedSpecialties[0][0];
    const recommendedDoctors = await getAvailableDoctors(topSpecialty, date);

    res.json({
      selectedSymptoms: normalizedSymptoms,
      recommendedSpecialty: topSpecialty,
      alternativeSpecialty: rankedSpecialties[1] ? rankedSpecialties[1][0] : null,
      specialtyScores: rankedSpecialties,
      recommendedDoctors,
      geminiEnhancement: unknownSymptomResult ? {
        unknownSymptoms: unknownSymptomResult.symptoms,
        aiSpecialty: unknownSymptomResult.specialty
      } : null
    });

  } catch (error) {
    console.error('Error in symptom search:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to get available doctors for a specialty
async function getAvailableDoctors(specialty, date) {
  try {
    // Import Doctor model dynamically to avoid circular dependencies
    const Doctor = (await import('../models/Doctor.js')).default;
    const User = (await import('../models/User.js')).default;
    const TimeSlot = (await import('../models/TimeSlot.js')).default;

    // Find all doctors with the specified specialty
    const doctors = await Doctor.find({ specialty: specialty })
      .populate('user', 'name email phoneNumber');

    if (doctors.length === 0) {
      console.log(`No doctors found for specialty: ${specialty}`);
      return [];
    }

    // Return doctors with available time slots from the central TimeSlot system
    const doctorsWithInfo = await Promise.all(doctors.map(async (doctor) => {
      // Get available time slots for this doctor
      const availableSlots = await TimeSlot.find({
        assignedTo: doctor._id,
        status: 'ASSIGNED'
      }).sort({ dayOfWeek: 1, timeSlot: 1 });

      // Format the slots for display
      const formattedSlots = availableSlots.map(slot => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `${days[slot.dayOfWeek]} ${slot.timeSlot}`;
      });

      return {
        id: doctor._id,
        _id: doctor._id,
        name: doctor.user?.name || 'Dr. Unknown',
        specialty: doctor.specialty,
        email: doctor.user?.email,
        phoneNumber: doctor.user?.phoneNumber,
        availableSlots: formattedSlots,
        totalAvailableSlots: formattedSlots.length
      };
    }));

    console.log(`Found ${doctorsWithInfo.length} doctors for specialty: ${specialty}`);
    return doctorsWithInfo;

  } catch (error) {
    console.error('Error getting available doctors:', error);
    return [];
  }
}
