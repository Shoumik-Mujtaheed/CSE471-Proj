// scripts/checkPendingSlots.js
// Check for pending time slot requests

import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import TimeSlot from '../models/TimeSlot.js';

dotenv.config();

const checkPendingSlots = async () => {
  try {
    await connectDB();
    console.log('🔍 Checking for pending time slot requests...');
    
    const pendingSlots = await TimeSlot.find({ status: 'PENDING' });
    console.log(`✅ Found ${pendingSlots.length} pending time slot(s):`);
    
    if (pendingSlots.length > 0) {
      pendingSlots.forEach((slot, index) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        console.log(`   ${index + 1}. ${days[slot.dayOfWeek]} ${slot.timeSlot} - ${slot.status}`);
        console.log(`      Doctor ID: ${slot.assignedTo}`);
        console.log(`      Notes: ${slot.notes || 'None'}`);
        console.log('');
      });
    } else {
      console.log('   No pending slots found');
    }
    
    // Also check all statuses
    const allSlots = await TimeSlot.find();
    const statusCounts = {};
    allSlots.forEach(slot => {
      statusCounts[slot.status] = (statusCounts[slot.status] || 0) + 1;
    });
    
    console.log('📊 Current time slot statuses:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

checkPendingSlots();
