import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Admin Schema (local copy for the script)
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    default: 'admin',
    immutable: true,
  },
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

// Function to hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Function to create admin
async function createAdmin(name, email, password) {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (existingAdmin) {
      console.log(`⚠️  Admin with email ${email} already exists!`);
      
      const answer = await new Promise((resolve) => {
        rl.question('Do you want to update the existing admin? (y/n): ', resolve);
      });
      
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        // Update existing admin
        const hashedPassword = await hashPassword(password);
        existingAdmin.name = name;
        existingAdmin.password = hashedPassword;
        await existingAdmin.save();
        
        console.log(`✅ Admin ${name} updated successfully!`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password} (hashed in database)`);
        return;
      } else {
        console.log('❌ Admin creation cancelled.');
        return;
      }
    }

    // Create new admin
    const hashedPassword = await hashPassword(password);
    
    const admin = new Admin({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();

    console.log(`✅ Admin ${name} created successfully!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password} (hashed in database)`);
    console.log(`🆔 Admin ID: ${admin._id}`);

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    
    if (error.code === 11000) {
      console.log('💡 Email already exists. Try updating instead.');
    }
  }
}

// Function to get user input
function getUserInput() {
  return new Promise((resolve) => {
    rl.question('Enter admin name: ', (name) => {
      rl.question('Enter admin email: ', (email) => {
        rl.question('Enter admin password: ', (password) => {
          resolve({ name, email, password });
        });
      });
    });
  });
}

// Main function
async function main() {
  try {
    console.log('🏥 Admin Creation Script');
    console.log('========================\n');

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'HospitalDB'
    });
    console.log('✅ Connected to MongoDB successfully!\n');

    // Get user input
    const { name, email, password } = await getUserInput();

    // Validate input
    if (!name || !email || !password) {
      console.log('❌ All fields are required!');
      rl.close();
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters long!');
      rl.close();
      process.exit(1);
    }

    console.log('\n🔄 Creating admin...\n');

    // Create admin
    await createAdmin(name, email, password);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    // Close connections
    rl.close();
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
main();







