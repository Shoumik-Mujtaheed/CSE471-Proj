import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';

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

const checkAdmins = async () => {
  try {
    console.log('🔍 Checking admin users in database...');
    
    const admins = await Admin.find({}).select('-password');
    
    if (admins.length === 0) {
      console.log('❌ No admin users found in database');
    } else {
      console.log(`✅ Found ${admins.length} admin user(s):`);
      admins.forEach((admin, index) => {
        console.log(`   ${index + 1}. ID: ${admin._id}`);
        console.log(`      Name: ${admin.name}`);
        console.log(`      Email: ${admin.email}`);
        console.log(`      Role: ${admin.role}`);
        console.log(`      Created: ${admin.createdAt}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking admins:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    await checkAdmins();
    process.exit(0);
  } catch (error) {
    console.error('❌ Main error:', error);
    process.exit(1);
  }
};

main();


