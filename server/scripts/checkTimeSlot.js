import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TimeSlot from '../models/TimeSlot.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'HospitalDB',
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const checkSpecificTimeSlot = async () => {
  try {
    console.log('🔍 Checking specific time slot...');
    
    // Check the Monday 8-12 slot that's causing issues
    const timeSlot = await TimeSlot.findOne({ 
      dayOfWeek: 1, 
      timeSlot: '8-12' 
    });
    
    if (!timeSlot) {
      console.log('❌ Time slot not found');
    } else {
      console.log('✅ Time slot found:');
      console.log(`   ID: ${timeSlot._id}`);
      console.log(`   Day: ${timeSlot.dayOfWeek} (Monday)`);
      console.log(`   Time: ${timeSlot.timeSlot}`);
      console.log(`   Status: ${timeSlot.status}`);
      console.log(`   Assigned To: ${timeSlot.assignedTo}`);
      console.log(`   Assigned At: ${timeSlot.assignedAt}`);
      console.log(`   Approved By: ${timeSlot.approvedBy}`);
      console.log(`   Approved At: ${timeSlot.approvedAt}`);
      console.log(`   Notes: ${timeSlot.notes}`);
      console.log(`   Has Appointment: ${timeSlot.hasAppointment}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking time slot:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    await checkSpecificTimeSlot();
    process.exit(0);
  } catch (error) {
    console.error('❌ Main error:', error);
    process.exit(1);
  }
};

main();


