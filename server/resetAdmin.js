// server/resetAdmin.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';        

dotenv.config();

// Admin information
const adminInfo = {
  name: 'admin2',
  email: 'admin2@gmail.com',
  password: 'admin2pass'
};

// Main function
async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔄 Resetting admin account...');

    // Delete existing admin
    await Admin.deleteMany({ email: adminInfo.email });
    console.log('✅ Deleted existing admin account');

    // Create the admin (password will be auto-hashed by the model)
    const newAdmin = new Admin({
      name: adminInfo.name,
      email: adminInfo.email,
      password: adminInfo.password
    });

    await newAdmin.save();
    console.log('✅ Admin created successfully!');
    console.log('📋 Admin Credentials:');
    console.log(`   Name: ${adminInfo.name}`);
    console.log(`   Password: ${adminInfo.password}`);
    console.log('🔐 Password is now properly hashed in database');

    process.exit(0);
  } catch (err) {
    console.error('Failed to reset admin:', err);
    process.exit(1);
  }
}

resetAdmin();