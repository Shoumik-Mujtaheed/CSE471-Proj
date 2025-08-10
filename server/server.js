import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';


import inventoryRoutes from './routes/InventoryRoutes.js';
import adminRoutes from './routes/AdminRoutes.js';
import prescriptionRoutes from './routes/PrescriptionRoutes.js';
import invoiceRoutes from './routes/InvoiceRoutes.js';
import UserRoutes from './routes/UserRoutes.js';
import DoctorRoutes from './routes/DoctorRoutes.js';

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
app.use('/api/doctor', DoctorRoutes);




// Basic test route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Hospital Management System API is running!',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// Basic info route
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Hospital Management System',
    version: '1.0.0',
    modules: ['Patient Management', 'Staff Management', 'Billing'],
    status: 'Under Development'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🏥 Hospital Management Server running on port ${PORT}`);
  console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
});
