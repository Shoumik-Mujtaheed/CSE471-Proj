import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const tryEnv = (p) => {
  const res = dotenv.config({ path: p });
  return !res.error;
};

const loaded =
  tryEnv(path.resolve(__dirname, '../.env')) ||
  tryEnv(path.resolve(__dirname, '../../.env'));

if (!loaded) {
  console.error('❌ Could not load .env file');
  process.exit(1);
}

const uri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  process.env.DATABASE_URL;

async function createPatient() {
  try {
    await mongoose.connect(uri, {
      dbName: 'HospitalDB'
    });
    console.log('✅ Connected to MongoDB');

    // Create a sample patient
    const patientData = {
      name: 'John Patient',
      email: 'patient@email.com',
      password: 'password123',
      phoneNumber: '+1234567891',
      role: 'patient',
      bloodGroup: 'A+'
    };

    // Check if patient already exists
    const existing = await User.findOne({ email: patientData.email });
    if (existing) {
      console.log('ℹ️  Patient already exists:', existing.email);
      console.log('✅ Patient ID:', existing._id);
      await mongoose.disconnect();
      return;
    }

    // Create new patient
    const patient = new User(patientData);
    await patient.save();

    console.log('🎉 Created patient:');
    console.log('  Name:', patient.name);
    console.log('  Email:', patient.email);
    console.log('  ID:', patient._id);
    console.log('  Blood Group:', patient.bloodGroup);

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating patient:', error);
    process.exit(1);
  }
}

createPatient();
