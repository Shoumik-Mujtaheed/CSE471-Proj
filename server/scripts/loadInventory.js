import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Inventory from '../models/Inventory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const tryEnv = (p) => {
  const res = dotenv.config({ path: p });
  return !res.error;
};

const loaded =
  tryEnv(path.resolve(__dirname, '../.env')) ||
  tryEnv(path.resolve(__dirname, '../../.env'));

if (!loaded) {
  console.error('❌ Could not load .env file');
  process.exit(1);
}

const uri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  process.env.DATABASE_URL;

if (!uri) {
  console.error('❌ No Mongo URI found in environment variables');
  process.exit(1);
}

async function loadInventoryData() {
  try {
    await mongoose.connect(uri, {
      dbName: 'HospitalDB'
    });
    console.log('✅ Connected to MongoDB');

    // Read CSV file
    const csvPath = path.resolve(__dirname, '../seed/Name-Pricetk-Quantity.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV (simple parsing)
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');
    
    const medicines = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        medicines.push({
          name: values[0].trim(),
          price: parseFloat(values[1]) || 0,
          quantity: parseInt(values[2]) || 0
        });
      }
    }

    // Clear existing data
    await Inventory.deleteMany({});
    console.log('🗑️  Cleared existing inventory');

    // Insert new data
    const result = await Inventory.insertMany(medicines);
    console.log(`✅ Loaded ${result.length} medicines into inventory`);

    console.log('\n📋 Sample medicines loaded:');
    result.slice(0, 5).forEach(med => {
      console.log(`  - ${med.name}: $${med.price} (${med.quantity} in stock)`);
    });

    await mongoose.disconnect();
    console.log('\n🎉 Inventory loaded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error loading inventory:', error);
    process.exit(1);
  }
}

loadInventoryData();
