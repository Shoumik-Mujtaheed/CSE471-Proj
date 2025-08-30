// server/createAdmin.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';        

dotenv.config();



// Admin information
const adminInfo = {
  name: 'admin2',
  email: 'admin2@gmail.com',
  password: 'admin2pass'
};

// Main function
async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if admin with same email already exists
    const exists = await Admin.findOne({ email: adminInfo.email });
    if (exists) {
      console.log('Admin already exists with this email.');
      process.exit(0);
    }

    // Create the admin (password will be auto-hashed by the model)
    const newAdmin = new Admin({
      name: adminInfo.name,
      email: adminInfo.email,
      password: adminInfo.password
    });

    await newAdmin.save();

    console.log('Admin created successfully!');
    process.exit(0);

  } catch (err) {
    console.error('Failed to create admin:', err);
    process.exit(1);
  }
}

createAdmin();
