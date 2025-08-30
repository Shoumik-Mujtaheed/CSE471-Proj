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

const checkTimeSlots = async () => {
  try {
    console.log('🔍 Checking time slots in database...');
    
    const timeSlots = await TimeSlot.find({});
    
    if (timeSlots.length === 0) {
      console.log('❌ No time slots found in database');
      console.log('💡 You need to run: npm run init:time-slots');
    } else {
      console.log(`✅ Found ${timeSlots.length} time slot(s):`);
      timeSlots.forEach((slot, index) => {
        console.log(`   ${index + 1}. ${getDayName(slot.dayOfWeek)} ${slot.timeSlot} - ${slot.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking time slots:', error);
  }
};

const getDayName = (dayNumber) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber];
};

const main = async () => {
  try {
    await connectDB();
    await checkTimeSlots();
    process.exit(0);
  } catch (error) {
    console.error('❌ Main error:', error);
    process.exit(1);
  }
};

main();


