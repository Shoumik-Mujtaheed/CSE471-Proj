// Script to populate the doctor database with doctors for each specialty
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Import models
const User = (await import('../models/User.js')).default;
const Doctor = (await import('../models/Doctor.js')).default;

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Doctor data with specialties
const doctorsData = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'dr.sarah.johnson@medicore.com',
    password: 'password123',
    phoneNumber: '+1-555-0101',
    specialty: 'General Medicine',
    department: 'Internal Medicine'
  },
  {
    name: 'Dr. Michael Chen',
    email: 'dr.michael.chen@medicore.com',
    password: 'password123',
    phoneNumber: '+1-555-0102',
    specialty: 'Cardiology',
    department: 'Cardiology'
  },
  {
    name: 'Dr. Emily Rodriguez',
    email: 'dr.emily.rodriguez@medicore.com',
    password: 'password123',
    phoneNumber: '+1-555-0103',
    specialty: 'Neurology',
    department: 'Neurology'
  },
  {
    name: 'Dr. David Thompson',
    email: 'dr.david.thompson@medicore.com',
    password: 'password123',
    phoneNumber: '+1-555-0104',
    specialty: 'Orthopedics',
    department: 'Orthopedics'
  },
  {
    name: 'Dr. Lisa Park',
    email: 'dr.lisa.park@medicore.com',
    password: 'password123',
    phoneNumber: '+1-555-0105',
    specialty: 'Pediatrics',
    department: 'Pediatrics'
  },
  {
    name: 'Dr. James Wilson',
    email: 'dr.james.wilson@medicore.com',
    password: 'password123',
    phoneNumber: '+1-555-0106',
    specialty: 'Dermatology',
    department: 'Dermatology'
  },
  {
    name: 'Dr. Maria Garcia',
    email: 'dr.maria.garcia@medicore.com',
    password: 'password123',
    phoneNumber: '+1-555-0107',
    specialty: 'Gastroenterology',
    department: 'Gastroenterology'
  },
  {
    name: 'Dr. Robert Kim',
    email: 'dr.robert.kim@medicore.com',
    password: 'password123',
    phoneNumber: '+1-555-0108',
    specialty: 'Endocrinology',
    department: 'Endocrinology'
  },
  {
    name: 'Dr. Jennifer Lee',
    email: 'dr.jennifer.lee@medicore.com',
    password: 'password123',
    phoneNumber: '+1-555-0109',
    specialty: 'Psychiatry',
    department: 'Psychiatry'
  },
  {
    name: 'Dr. Christopher Brown',
    email: 'dr.christopher.brown@medicore.com',
    password: 'password123',
    phoneNumber: '+1-555-0110',
    specialty: 'Ophthalmology',
    department: 'Ophthalmology'
  },
  {
    name: 'Dr. Amanda Davis',
    email: 'dr.amanda.davis@medicore.com',
    password: 'password123',
    phoneNumber: '+1-555-0111',
    specialty: 'ENT',
    department: 'ENT'
  },
  {
    name: 'Dr. Kevin Martinez',
    email: 'dr.kevin.martinez@medicore.com',
    password: 'password123',
    phoneNumber: '+1-555-0112',
    specialty: 'Urology',
    department: 'Urology'
  },
  {
    name: 'Dr. Rachel Green',
    email: 'dr.rachel.green@medicore.com',
    password: 'password123',
    phoneNumber: '+1-555-0113',
    specialty: 'Gynecology',
    department: 'Gynecology'
  },
  {
    name: 'Dr. Thomas Anderson',
    email: 'dr.thomas.anderson@medicore.com',
    password: 'password123',
    phoneNumber: '+1-555-0114',
    specialty: 'Oncology',
    department: 'Oncology'
  },
  {
    name: 'Dr. Nicole Taylor',
    email: 'dr.nicole.taylor@medicore.com',
    password: 'password123',
    phoneNumber: '+1-555-0115',
    specialty: 'Emergency Medicine',
    department: 'Emergency Medicine'
  }
];

// Seed doctors function
const seedDoctors = async () => {
  try {
    console.log('🚀 Starting to seed doctors...');
    
    // Clear existing doctors and their users
    console.log('🧹 Clearing existing doctors...');
    await Doctor.deleteMany({});
    
    console.log('🧹 Clearing existing doctor users...');
    await User.deleteMany({ role: 'doctor' });
    
    let createdCount = 0;
    
    for (const doctorData of doctorsData) {
      try {
        // Create user first
        const user = new User({
          name: doctorData.name,
          email: doctorData.email,
          password: doctorData.password,
          phoneNumber: doctorData.phoneNumber,
          role: 'doctor'
        });
        
        await user.save();
        console.log(`✅ Created user: ${doctorData.name}`);
        
        // Create doctor
        const doctor = new Doctor({
          user: user._id,
          specialty: doctorData.specialty,
          department: doctorData.department
        });
        
        await doctor.save();
        console.log(`✅ Created doctor: ${doctorData.name} - ${doctorData.specialty}`);
        
        createdCount++;
        
      } catch (error) {
        console.error(`❌ Error creating ${doctorData.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully created ${createdCount} doctors!`);
    
    // Show summary
    const allDoctors = await Doctor.find({}).populate('user', 'name email');
    console.log('\n📊 Database Summary:');
    console.log(`Total doctors: ${allDoctors.length}`);
    
    const specialties = [...new Set(allDoctors.map(d => d.specialty))];
    console.log('Available specialties:', specialties);
    
    console.log('\n👨‍⚕️ Doctor List:');
    allDoctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.user.name} - ${doctor.specialty}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
};

// Run the seed function
connectDB().then(() => {
  seedDoctors();
});
