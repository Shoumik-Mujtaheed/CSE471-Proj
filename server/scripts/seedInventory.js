import mongoose from 'mongoose';
import csv from 'csvtojson';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the Inventory model
import Inventory from '../models/Inventory.js';

// Database connection
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

// Parse CSV and seed inventory
const seedInventory = async () => {
  try {
    // Read the CSV file
    const csvFilePath = path.join(__dirname, '../seed/Name-Pricetk-Quantity.csv');
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    
    // Parse CSV to JSON
    const medicines = await csv({
      trim: true,
      ignoreEmpty: true
    }).fromString(csvData);
    
    console.log(`Found ${medicines.length} medicines in CSV`);
    
    // Clear existing inventory
    await Inventory.deleteMany({});
    console.log('Cleared existing inventory');
    
    // Transform and insert medicines
    const inventoryData = medicines.map(medicine => ({
      name: medicine.name.trim(),
      price: parseFloat(medicine.price),
      quantity: parseInt(medicine.quantity) || 0,
      reorderThreshold: 10,
      reorderQuantity: 50,
      supplier: 'Default Supplier',
      needsReorder: false
    }));
    
    // Insert all medicines
    const result = await Inventory.insertMany(inventoryData);
    console.log(`Successfully seeded ${result.length} medicines to inventory`);
    
    // Display some sample data
    console.log('\nSample inventory items:');
    result.slice(0, 5).forEach(item => {
      console.log(`- ${item.name}: $${item.price}, Qty: ${item.quantity}`);
    });
    
  } catch (error) {
    console.error('Error seeding inventory:', error);
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await seedInventory();
    console.log('\nInventory seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error in main execution:', error);
    process.exit(1);
  }
};

// Run the script
main();



