// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Route imports
import inventoryRoutes from './routes/InventoryRoutes.js';
import doctorRoutes    from './routes/doctor.js';
import staffRoutes     from './routes/staff.js';
import adminRoutes     from './routes/admin.js';

dotenv.config();    // Load .env variables
connectDB();        // Connect to MongoDB

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== Routes =====
// Doctor routes (auth + patients + timeslots all in one router)
app.use('/api/doctor', doctorRoutes);

// Staff routes (auth + leave requests)
app.use('/api/staff', staffRoutes);

// Inventory routes (medicine CRUD & bulk upload)
app.use('/api/inventory', inventoryRoutes);

app.use('/api/admin', adminRoutes);



// ===== Health Check =====
app.get('/api/health', (req, res) => {
  res.json({
    message:   'Hospital Management System API is running!',
    status:    'active',
    timestamp: new Date().toISOString()
  });
});

// ===== API Info =====
app.get('/api/info', (req, res) => {
  res.json({
    name:     'Hospital Management System',
    version:  '1.0.0',
    modules: [
      'Patient Management',
      'Staff Management',
      'Billing',
      'Doctor Dashboard'
    ],
    status: 'Under Development'
  });
});

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🏥 Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});
