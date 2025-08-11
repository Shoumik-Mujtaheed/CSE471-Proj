// testPrescription.js - Enhanced version with better error handling
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables first
console.log('🔧 Loading environment variables...');
dotenv.config();
console.log('📁 MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');

// Import models with error handling
try {
  console.log('📦 Importing models...');
  const User = (await import('./server/models/User.js')).default;
  const Prescription = (await import('./server/models/Prescription.js')).default;
  const Inventory = (await import('./server/models/Inventory.js')).default;
  const { generateInvoiceForPrescription } = await import('./server/controllers/InvoiceController.js');
  
  console.log('✅ All imports successful');

  const testPrescription = async () => {
    try {
      // Connect to database
      console.log('🔌 Attempting to connect to MongoDB...');
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital';
      console.log('🔗 Using URI:', mongoUri);
      
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB successfully');

      // Check database connection
      const dbState = mongoose.connection.readyState;
      console.log('📊 Database state:', dbState === 1 ? 'Connected' : 'Not connected');

      // Step 1: Find a patient user
      console.log('\n👤 Searching for patient user...');
      const patientCount = await User.countDocuments({ role: 'patient' });
      console.log(`📊 Total patients in database: ${patientCount}`);
      
      const patient = await User.findOne({ role: 'patient' });
      if (!patient) {
        console.log('❌ No patient found. Available users:');
        const allUsers = await User.find({}, 'name email role');
        console.log(allUsers);
        throw new Error('No patient user available');
      }
      console.log('✅ Found patient:', patient.name, '(' + patient.email + ')');

      // Step 2: Find a doctor user
      console.log('\n👨‍⚕️ Searching for doctor user...');
      const doctorCount = await User.countDocuments({ role: 'doctor' });
      console.log(`📊 Total doctors in database: ${doctorCount}`);
      
      const doctor = await User.findOne({ role: 'doctor' });
      if (!doctor) {
        console.log('❌ No doctor found. Available users:');
        const allUsers = await User.find({}, 'name email role');
        console.log(allUsers);
        throw new Error('No doctor user available');
      }
      console.log('✅ Found doctor:', doctor.name, '(' + doctor.email + ')');

      // Step 3: Find medicines in inventory
      console.log('\n💊 Searching for medicines in inventory...');
      const medicineCount = await Inventory.countDocuments();
      console.log(`📊 Total inventory items: ${medicineCount}`);
      
      const medicines = await Inventory.find().limit(3);
      if (medicines.length === 0) {
        console.log('❌ No medicines found. Adding sample inventory...');
        
        // Create sample inventory items for testing
        const sampleMedicines = await Inventory.insertMany([
          {
            name: 'Paracetamol',
            category: 'Pain Relief',
            quantity: 100,
            price: 8.50,
            description: 'Pain and fever relief'
          },
          {
            name: 'Aspirin',
            category: 'Pain Relief',
            quantity: 50,
            price: 12.00,
            description: 'Anti-inflammatory'
          },
          {
            name: 'Ibuprofen',
            category: 'Pain Relief',
            quantity: 75,
            price: 5.50,
            description: 'Anti-inflammatory pain relief'
          }
        ]);
        
        console.log('✅ Created sample inventory items');
        medicines.push(...sampleMedicines);
      }
      
      console.log(`✅ Found ${medicines.length} medicines:`, medicines.map(m => m.name || 'Unnamed Medicine'));

      // Step 4: Create prescription data
      console.log('\n📝 Preparing prescription data...');
      const prescribedMedicines = medicines.map((med, index) => {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = med.price || (Math.random() * 20 + 5);
        
        return {
          medicineId: med._id,
          medicineName: med.name || `Medicine ${index + 1}`,
          quantity: quantity,
          price: price,
          instructions: `Take ${quantity} time${quantity > 1 ? 's' : ''} daily`,
          total: quantity * price
        };
      });

      const totalAmount = prescribedMedicines.reduce((sum, med) => sum + med.total, 0);
      console.log('💰 Calculated total amount:', totalAmount);

      // Step 5: Create prescription
      console.log('\n📝 Creating prescription in database...');
      const prescription = await Prescription.create({
        patient: patient._id,
        doctor: doctor._id,
        disease: 'Test Disease - Common Cold & Fever',
        prescribedMedicines,
        totalAmount,
        status: 'active'
      });

      console.log('✅ Prescription created with ID:', prescription._id);

      // Step 6: Generate invoice
      console.log('\n🧾 Generating invoice...');
      const invoice = await generateInvoiceForPrescription(prescription._id);
      console.log('✅ Invoice generated:', invoice.invoiceNumber);

      // Step 7: Display results
      console.log('\n📋 TEST RESULTS SUMMARY:');
      console.log('='.repeat(50));
      console.log('Patient:', patient.name, '(' + patient.email + ')');
      console.log('Doctor:', doctor.name, '(' + doctor.email + ')');
      console.log('Disease:', 'Test Disease - Common Cold & Fever');
      console.log('Prescription ID:', prescription._id);
      console.log('Invoice Number:', invoice.invoiceNumber);
      console.log('Subtotal: $' + invoice.subtotal.toFixed(2));
      console.log('Tax: $' + invoice.tax.toFixed(2));
      console.log('Total Amount: $' + invoice.totalAmount.toFixed(2));
      console.log('Status:', invoice.status);
      
      console.log('\nPrescribed Medicines:');
      prescribedMedicines.forEach((med, index) => {
        console.log(`  ${index + 1}. ${med.medicineName} - Qty: ${med.quantity}, Price: $${med.price.toFixed(2)}, Total: $${med.total.toFixed(2)}`);
        console.log(`     Instructions: ${med.instructions}`);
      });

      console.log('\n🎉 Test completed successfully!');

    } catch (error) {
      console.error('\n❌ Error during test execution:');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      
      // Additional debugging
      if (error.name === 'ValidationError') {
        console.error('Validation errors:', error.errors);
      }
    } finally {
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
      }
      process.exit(0);
    }
  };

  // Run the test
  await testPrescription();

} catch (importError) {
  console.error('❌ Import error:', importError.message);
  console.error('Make sure all model files exist and are properly structured');
  console.error('Stack:', importError.stack);
  process.exit(1);
}
