const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
