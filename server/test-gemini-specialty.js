// Test file for Gemini specialty recommendation
import dotenv from 'dotenv';
import { callGemini } from './utils/geminiApi.js';

// Load environment variables
dotenv.config();

const testGeminiSpecialtyRecommendation = async () => {
  console.log('🧪 Testing Gemini Specialty Recommendation...\n');
  
  const availableSpecialties = [
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

  const testSymptoms = [
    'chest pain',
    'headache',
    'fever and cough',
    'unknown symptom xyz'
  ];

  for (const symptom of testSymptoms) {
    console.log(`🔍 Testing symptoms: "${symptom}"`);
    
    const prompt = `Available specialties: ${availableSpecialties.join(', ')}

Patient symptoms: ${symptom}

Which specialty is best suited for these symptoms? Answer with just the specialty name.`;

    try {
      const result = await callGemini(prompt);
      console.log(`✅ Gemini Response: "${result}"`);
      
      if (availableSpecialties.includes(result)) {
        console.log(`✅ Valid specialty found in our list`);
      } else {
        console.log(`⚠️  Response not in our specialty list, will fallback to General Medicine`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('---');
  }
};

// Run test
testGeminiSpecialtyRecommendation().catch(console.error);
