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

const initializeTimeSlots = async () => {
  try {
    console.log('🚀 Initializing central time slot system...');
    
    // Check if slots already exist
    const existingSlots = await TimeSlot.countDocuments();
    if (existingSlots > 0) {
      console.log(`⚠️  Found ${existingSlots} existing time slots. Clearing them first...`);
      await TimeSlot.deleteMany({});
    }

    const days = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
    const timeSlots = ['8-12', '12-4', '4-8', '20-00'];
    
    const slotsToCreate = [];
    
    // Create all 28 slots (7 days × 4 time slots)
    for (const day of days) {
      for (const timeSlot of timeSlots) {
        slotsToCreate.push({
          dayOfWeek: day,
          timeSlot: timeSlot,
          status: 'AVAILABLE',
          notes: `${getDayName(day)} ${timeSlot}`
        });
      }
    }
    
    // Insert all slots
    const createdSlots = await TimeSlot.insertMany(slotsToCreate);
    
    console.log(`✅ Successfully created ${createdSlots.length} time slots:`);
    
    // Display the slots
    for (const slot of createdSlots) {
      console.log(`   ${getDayName(slot.dayOfWeek)} ${slot.timeSlot} - ${slot.status}`);
    }
    
    console.log('\n🎯 Central time slot system initialized successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Doctors can request time slots');
    console.log('   2. Admins can approve/reject requests');
    console.log('   3. Patients can book available slots');
    
  } catch (error) {
    console.error('❌ Error initializing time slots:', error);
  }
};

const getDayName = (dayNumber) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber];
};

const main = async () => {
  try {
    await connectDB();
    await initializeTimeSlots();
    process.exit(0);
  } catch (error) {
    console.error('❌ Main error:', error);
    process.exit(1);
  }
};

main();


