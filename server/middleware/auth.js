// server/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Staff from '../models/Staff.js';
import Admin from '../models/Admin.js';

// Main authentication middleware for users (patients, doctors, staff)
export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const token = header.split(' ')[1];
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not founds' });
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token invalid' });
  }
};

// Middleware to load doctor profile and attach doctorId to req.user
export const loadDoctor = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctor role required.' });
    }
    
    const doc = await Doctor.findOne({ user: req.user._id });
    if (!doc) return res.status(403).json({ message: 'Doctor profile not found' });
    req.user.doctorId = doc._id;
    next();
  } catch (e) {
    res.status(500).json({ message: 'Server error loading doctor profile' });
  }
};

// Middleware to load staff profile and attach staffId to req.user
export const loadStaff = async (req, res, next) => {
  try {
    if (req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Access denied. Staff role required.' });
    }
    
    const staff = await Staff.findOne({ user: req.user._id });
    if (!staff) return res.status(403).json({ message: 'Staff profile not found' });
    req.user.staffId = staff._id;
    next();
  } catch (e) {
    res.status(500).json({ message: 'Server error loading staff profile' });
  }
};

// Middleware for role-based access control
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }
    
    next();
  };
};

// Combined middleware for doctor authentication (protect + loadDoctor)
export const authenticateDoctor = [protect, loadDoctor];

// Combined middleware for staff authentication (protect + loadStaff)
export const authenticateStaff = [protect, loadStaff];

// Middleware for patient-only access
export const authenticatePatient = [protect, requireRole(['patient'])];
