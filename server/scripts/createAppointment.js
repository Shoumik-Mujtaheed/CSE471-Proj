import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medicore');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create appointment function
const createAppointment = async () => {
  try {
    console.log('🔍 Looking for available patients and doctor...');
    
    // Find or create a test doctor
    let doctor = await Doctor.findOne({ specialty: 'General Medicine' });
    if (!doctor) {
      console.log('❌ No doctor found. Creating a test doctor...');
      
      // First create a User with doctor role
      const doctorUser = new User({
        name: 'Dr. Test Doctor',
        email: 'doctor.test@medicore.com',
        password: 'doctor123',
        phoneNumber: '+1234567890',
        role: 'doctor',
        bloodGroup: 'A+'
      });
      
      await doctorUser.save();
      console.log('✅ Doctor user created:', doctorUser.name);
      
      // Then create the Doctor profile
      const testDoctor = new Doctor({
        user: doctorUser._id,
        specialty: 'General Medicine',
        department: 'Internal Medicine'
      });
      
      await testDoctor.save();
      doctor = testDoctor;
      console.log('✅ Test doctor profile created with ID:', doctor._id);
    } else {
      console.log('✅ Doctor found:', doctor.specialty, 'with ID:', doctor._id);
    }
    
    // Find the specific patient with email patient10@gmail.com
    let patient = await User.findOne({ email: 'patient10@gmail.com' });
    if (!patient) {
      console.log('❌ Patient with email patient10@gmail.com not found. Creating the patient...');
      
      // Create the specific patient
      patient = new User({
        name: 'Patient Ten',
        email: 'patient10@gmail.com',
        password: 'patient10',
        phoneNumber: '+1234567890',
        role: 'patient',
        bloodGroup: 'O+'
      });
      
      await patient.save();
      console.log('✅ Patient created:', patient.name, 'with email:', patient.email);
    } else {
      console.log('✅ Patient found:', patient.name, 'with email:', patient.email);
    }
    
    // Create appointment for today
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const appointment = new Appointment({
      user: patient._id,
      doctor: doctor._id, // Use the actual doctor ObjectId
      date: today,
      dayOfWeek: dayOfWeek,
      timeSlot: '8-12', // Morning slot
      reason: 'General checkup and consultation',
      urgency: 'normal',
      status: 'booked',
      notes: 'Appointment created for demonstration purposes',
      consultationFee: 50,
      paymentStatus: 'pending'
    });
    
    await appointment.save();
    console.log('✅ Appointment created successfully!');
    console.log('📅 Appointment Details:');
    console.log(`   Patient: ${patient.name} (${patient.email})`);
    console.log(`   Doctor ID: ${doctor._id}`);
    console.log(`   Date: ${today.toLocaleDateString()}`);
    console.log(`   Time: 8:00 AM - 12:00 PM`);
    console.log(`   Status: ${appointment.status}`);
    
    // Also create a few more appointments for different times
    const appointments = [
      {
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        dayOfWeek: (dayOfWeek + 1) % 7,
        timeSlot: '12-4',
        reason: 'Follow-up consultation',
        urgency: 'low'
      },
      {
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        dayOfWeek: (dayOfWeek + 2) % 7,
        timeSlot: '4-8',
        reason: 'Routine checkup',
        urgency: 'normal'
      }
    ];
    
    for (const apptData of appointments) {
      const additionalAppointment = new Appointment({
        user: patient._id,
        doctor: doctor._id, // Use the actual doctor ObjectId
        ...apptData,
        status: 'booked',
        notes: 'Additional appointment for demonstration',
        consultationFee: 50,
        paymentStatus: 'pending'
      });
      
      await additionalAppointment.save();
      console.log(`✅ Additional appointment created for ${apptData.date.toLocaleDateString()}`);
    }
    
    console.log('\n🎯 Total appointments created: 3');
    console.log('📋 You can now demonstrate the appointment system!');
    
  } catch (error) {
    console.error('❌ Error creating appointment:', error);
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await createAppointment();
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
};

// Run the script
main();
