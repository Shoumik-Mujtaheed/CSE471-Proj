// server/createAdmin.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import Admin from '../models/Admin.js';        

dotenv.config();

// Admin information
const adminInfo = {
  username: 'Shoumik M',
  email: 'shoumik.mujtaheed@gmail.com',
  password: 'admin1@sho'
};

// Main function
async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Check if admin with same email already exists
    const exists = await Admin.findOne({ email: adminInfo.email });
    if (exists) {
      console.log('Admin already exists with this email.');
      process.exit(0);
    }

    // Hash the password
    const hashed = await bcrypt.hash(adminInfo.password, 10);

    // Create the admin
    const newAdmin = new Admin({
      username: adminInfo.username,
      email: adminInfo.email,
      password: hashed
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
