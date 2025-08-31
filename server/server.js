import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import inventoryRoutes from './routes/InventoryRoutes.js';
import adminRoutes from './routes/AdminRoutes.js';
import prescriptionRoutes from './routes/PrescriptionRoutes.js';
import invoiceRoutes from './routes/InvoiceRoutes.js';
import UserRoutes from './routes/UserRoutes.js';
import doctorRoutes from './routes/doctor.js';
import staffRoutes from './routes/staff.js';
import triageRoutes from './routes/triage.js';
import appointmentRoutes from './routes/appointment.js';
import timeSlotRoutes from './routes/timeSlot.js';

// Suppress dotenv logs
process.env.DOTENV_LOG_LEVEL = 'silent';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', UserRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/time-slots', timeSlotRoutes);

// Basic test route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'mediCore API is running!',
    timestamp: new Date().toISOString()
  });
});

// System info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'mediCore',
    version: '1.0.0',
    modules: ['User Management', 'Doctor Management', 'Staff Management', 'Inventory Management', 'Prescription Management', 'Central Time Slot System'],
    status: 'active'
  });
});

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🏥 mediCore Server running on port ${PORT}`);
});
