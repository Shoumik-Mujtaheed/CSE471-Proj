import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1) Load env: try server/.env then root .env
const tried = [];
const tryEnv = (p) => {
  tried.push(p);
  const res = dotenv.config({ path: p });
  return !res.error;
};

const loaded =
  tryEnv(path.resolve(__dirname, '../.env')) ||        // server/.env
  tryEnv(path.resolve(__dirname, '../../.env'));       // project root .env

if (!loaded) {
  console.error('❌ Could not load .env. Tried:\n - ' + tried.join('\n - '));
  process.exit(1);
}

// 2) Get URI from multiple common keys
const uri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  process.env.DATABASE_URL;

if (!uri) {
  console.error('❌ No Mongo URI found. Set one of: MONGO_URI / MONGODB_URI / MONGO_URL / DATABASE_URL');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected:', uri.split('@').pop());

    const email = 'admin@example.com';   // change if you want
    const plain = '123456';              // change after first login
    const name  = 'Super Admin';

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log('ℹ️ Admin already exists:', existing.email);
      console.log('Nothing to do. (If you want to reset password, update it in DB directly.)');
      return;
    }

    const hash = await bcrypt.hash(plain, 10);
    const admin = await Admin.create({
      name,
      email: email.toLowerCase(),
      password: hash,   // store hashed
    });

    console.log('🎉 Created admin:', admin.email);
    console.log('➡️  Login with: POST /api/admin/login { "email": "' + email + '", "password": "' + plain + '" }');
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
