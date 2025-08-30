import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
      console.log('💡 Use --force flag to update existing admin');
      return false;
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
    return true;

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    return false;
  }
}

// Function to update existing admin
async function updateAdmin(name, email, password) {
  try {
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!existingAdmin) {
      console.log(`❌ Admin with email ${email} not found!`);
      return false;
    }

    const hashedPassword = await hashPassword(password);
    existingAdmin.name = name;
    existingAdmin.password = hashedPassword;
    await existingAdmin.save();

    console.log(`✅ Admin ${name} updated successfully!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password} (hashed in database)`);
    return true;

  } catch (error) {
    console.error('❌ Error updating admin:', error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.log('🏥 Admin Creation Script');
      console.log('========================\n');
      console.log('Usage: node createAdminSimple.js <name> <email> <password> [--force]');
      console.log('\nExamples:');
      console.log('  node createAdminSimple.js "John Admin" "admin@hospital.com" "admin123"');
      console.log('  node createAdminSimple.js "John Admin" "admin@hospital.com" "admin123" --force');
      console.log('\nFlags:');
      console.log('  --force    Update existing admin if email already exists');
      process.exit(1);
    }

    const [name, email, password, ...flags] = args;
    const forceUpdate = flags.includes('--force');

    console.log('🏥 Admin Creation Script');
    console.log('========================\n');

    // Validate input
    if (!name || !email || !password) {
      console.log('❌ All fields are required!');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters long!');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'HospitalDB'
    });
    console.log('✅ Connected to MongoDB successfully!\n');

    console.log('🔄 Processing admin...\n');

    let success = false;
    
    if (forceUpdate) {
      success = await updateAdmin(name, email, password);
    } else {
      success = await createAdmin(name, email, password);
    }

    if (!success && !forceUpdate) {
      console.log('\n💡 Tip: Use --force flag to update existing admin');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    // Close connections
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
main();







