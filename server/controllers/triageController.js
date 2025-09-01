// controllers/triageController.js
// Smart Symptom Search → Specialist → Bookable Doctors (Rule-Based)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callGemini } from '../utils/geminiApi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadConfig = (filename) => {
  try {
    const filePath = path.join(__dirname, '../config/triage', filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
};

const SYMPTOMS = loadConfig('symptoms.json');
const SYMPTOM_WEIGHTS = loadConfig('symptom_weights.json');
const SYMPTOM_SPECIALTY_MATRIX = loadConfig('symptom_specialty_matrix.json');

// Get available specialties from database (simplified)
const getAvailableSpecialties = () => {
  // Common medical specialties - you can expand this list
  return [
    'General Medicine',
    'Cardiology', 
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Dermatology',
    'Gastroenterology',
    'Endocrinology',
    'Psychiatry',
    'Ophthalmology',
    'ENT',
    'Urology',
    'Gynecology',
    'Oncology',
    'Emergency Medicine'
  ];
};

// Ask Gemini to recommend specialty for unknown symptoms
const getGeminiSpecialtyRecommendation = async (symptoms) => {
  const availableSpecialties = getAvailableSpecialties();
  
  const prompt = `Available specialties: ${availableSpecialties.join(', ')}

Patient symptoms: ${symptoms.join(', ')}

Which specialty is best suited for these symptoms? Answer with just the specialty name.`;

  console.log('🔍 Calling Gemini with prompt:', prompt);
  console.log('📋 Available specialties for Gemini:', availableSpecialties);
  
  const geminiResult = await callGemini(prompt);
  
  console.log('✅ Gemini raw response:', geminiResult);
  console.log('🔍 Gemini response type:', typeof geminiResult);
  console.log('📏 Gemini response length:', geminiResult ? geminiResult.length : 'N/A');
  console.log('🔍 Available specialties to match against:', availableSpecialties);
  
  if (geminiResult && availableSpecialties.includes(geminiResult)) {
    console.log('✅ Gemini response matches our specialty list:', geminiResult);
    console.log('🎯 SUCCESS: Using Gemini recommendation');
    return geminiResult;
  } else {
    console.log('⚠️  Gemini response not in our specialty list, falling back to General Medicine');
    console.log('❌ Expected one of:', availableSpecialties);
    console.log('❌ Got from Gemini:', geminiResult);
    console.log('🔄 FALLBACK: Using General Medicine');
    return 'General Medicine'; // Fallback if Gemini response is invalid
  }
};

export const getSymptomSuggestions = async (req, res) => {
  try {
    const { query = '' } = req.query;
    
    if (query.length < 2) {
      return res.json([]);
    }

    const normalizedQuery = query.toLowerCase();
    const suggestions = SYMPTOMS.filter(symptom =>
      symptom.toLowerCase().includes(normalizedQuery)
    );

    res.json(suggestions);
  } catch (error) {
    console.error('Error getting symptom suggestions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const searchBySymptoms = async (req, res) => {
  try {
    const { symptoms = [], date = new Date().toISOString().split('T')[0] } = req.body;
    
    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: 'Symptoms array is required' });
    }

    // Check if symptoms are in our database
    const knownSymptoms = symptoms.filter(symptom =>
      SYMPTOMS.includes(symptom)
    );

    const unknownSymptoms = symptoms.filter(symptom =>
      !SYMPTOMS.includes(symptom)
    );

    let recommendedSpecialty = 'General Medicine';
    let specialtyScores = {};

    // If we have known symptoms, use rule-based scoring
    if (knownSymptoms.length > 0) {
      // Calculate scores from symptom-specialty matrix
      knownSymptoms.forEach(symptom => {
        const symptomData = SYMPTOM_SPECIALTY_MATRIX[symptom.toLowerCase()];
        
        if (symptomData) {
          Object.entries(symptomData).forEach(([specialty, score]) => {
            specialtyScores[specialty] = (specialtyScores[specialty] || 0) + score;
          });
        }
      });

      // Get top scoring specialties
      const rankedSpecialties = Object.entries(specialtyScores)
        .filter(([_, score]) => score >= 0.35)
        .sort(([_, a], [__, b]) => b - a)
        .slice(0, 2);

      if (rankedSpecialties.length > 0) {
        recommendedSpecialty = rankedSpecialties[0][0];
      }
    }

    // If we have unknown symptoms, ask Gemini for specialty recommendation
    if (unknownSymptoms.length > 0) {
      console.log('🚀 Calling Gemini for unknown symptoms:', unknownSymptoms);
      const geminiSpecialty = await getGeminiSpecialtyRecommendation(unknownSymptoms);
      recommendedSpecialty = geminiSpecialty;
      console.log('🎯 Final recommended specialty:', recommendedSpecialty);
      console.log('🔍 Gemini API Response:', geminiSpecialty);
      console.log('📝 Gemini Response Type:', typeof geminiSpecialty);
      console.log('📏 Gemini Response Length:', geminiSpecialty ? geminiSpecialty.length : 'N/A');
    }

    // Get available doctors for the recommended specialty
    const recommendedDoctors = await getAvailableDoctors(recommendedSpecialty, date);

    res.json({
      selectedSymptoms: symptoms,
      recommendedSpecialty: recommendedSpecialty,
      specialtyScores: Object.entries(specialtyScores)
        .sort(([_, a], [__, b]) => b - a)
        .slice(0, 3),
      recommendedDoctors,
      doctorCount: recommendedDoctors.length > 0 && recommendedDoctors[0].id === 'no-specialist' ? 0 : recommendedDoctors.length,
      message: recommendedDoctors.length > 0 && recommendedDoctors[0].id === 'no-specialist' 
        ? recommendedDoctors[0].message 
        : `Found ${recommendedDoctors.length} doctor(s) for ${recommendedSpecialty}`,
      noSpecialistMessage: recommendedDoctors.length > 0 && recommendedDoctors[0].id === 'no-specialist' ? recommendedDoctors[0].message : null,
      geminiEnhancement: unknownSymptoms.length > 0 ? {
        unknownSymptoms: unknownSymptoms,
        aiSpecialty: recommendedSpecialty
      } : null
    });

  } catch (error) {
    console.error('Error in searchBySymptoms:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

async function getAvailableDoctors(specialty, date) {
  try {
    console.log('🔍 Looking for doctors with specialty:', specialty);
    
    // Import Doctor model dynamically to avoid circular dependencies
    const { default: Doctor } = await import('../models/Doctor.js');
    
    // First, let's see what specialties exist in the database
    const allDoctors = await Doctor.find({}).populate('user', 'name email phoneNumber');
    console.log('📊 Total doctors in database:', allDoctors.length);
    
    // Show all doctors and their specialties
    allDoctors.forEach((doctor, index) => {
      console.log(`👨‍⚕️ Doctor ${index + 1}:`, {
        name: doctor.user?.name || 'Unknown',
        specialty: doctor.specialty
      });
    });
    
    const availableSpecialties = [...new Set(allDoctors.map(d => d.specialty))];
    console.log('🏥 Available specialties in database:', availableSpecialties);
    
    const doctors = await Doctor.find({ 
      specialty: { $regex: specialty, $options: 'i' }
    }).populate('user', 'name email phoneNumber');

    console.log('✅ Found doctors for specialty:', specialty, 'Count:', doctors.length);

    // If no doctors found for the recommended specialty, return a special message
    if (doctors.length === 0) {
      console.log('⚠️  No doctors found for specialty:', specialty);
      return [{
        id: 'no-specialist',
        name: 'No Specialist Available',
        specialty: specialty,
        email: 'N/A',
        phoneNumber: 'N/A',
        message: `There is no ${specialty} specialist available right now. Please try General Medicine or contact us for assistance.`
      }];
    }

    // Import TimeSlot model to get available slots (like regular doctor search)
    const TimeSlot = (await import('../models/TimeSlot.js')).default;

    // Format doctor data with available time slots (same format as regular search)
    const formattedDoctors = await Promise.all(doctors.map(async (doctor) => {
      // Get available time slots for this doctor from the central TimeSlot system
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

    console.log('🎯 Returning formatted doctors with time slots:', formattedDoctors.length);
    return formattedDoctors;
    
  } catch (error) {
    console.error('Error getting available doctors:', error);
    return [];
  }
}
