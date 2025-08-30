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

// Cleanup function
const cleanupTemporaryData = async () => {
  try {
    console.log('🧹 Starting cleanup of temporary demonstration data...');
    
    // Remove test doctor user
    const doctorUser = await User.findOne({ email: 'doctor.test@medicore.com' });
    if (doctorUser) {
      // First remove the doctor profile
      await Doctor.deleteOne({ user: doctorUser._id });
      console.log('✅ Removed test doctor profile');
      
      // Then remove appointments for this doctor
      const deletedAppointments = await Appointment.deleteMany({ doctor: { $exists: true } });
      console.log(`✅ Removed ${deletedAppointments.deletedCount} test appointments`);
      
      // Finally remove the doctor user
      await User.deleteOne({ _id: doctorUser._id });
      console.log('✅ Removed test doctor user');
    } else {
      console.log('ℹ️ No test doctor found to remove');
    }
    
    // Optional: Remove the test patient if needed (uncomment if you want to remove it)
    // const testPatient = await User.findOne({ email: 'patient10@gmail.com' });
    // if (testPatient) {
    //   await User.deleteOne({ _id: testPatient._id });
    //   console.log('✅ Removed test patient');
    // }
    
    console.log('🎯 Cleanup completed successfully!');
    console.log('📋 Database is now clean of temporary demonstration data');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await cleanupTemporaryData();
    console.log('\n✅ Cleanup script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup script failed:', error);
    process.exit(1);
  }
};

// Run the script
main();
