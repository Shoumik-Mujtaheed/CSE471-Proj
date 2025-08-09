// server/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Staff from '../models/Staff.js';

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token' });
  }

  try {
    const token = header.split(' ')[1];
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token invalid' });
  }
};

export const loadDoctor = async (req, res, next) => {
  try {
    const doc = await Doctor.findOne({ user: req.user._id });
    if (!doc) return res.status(403).json({ message: 'Not a doctor' });
    req.user.doctorId = doc._id;
    next();
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const loadStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findOne({ user: req.user._id });
    if (!staff) return res.status(403).json({ message: 'Not a staff member' });
    req.user.staffId = staff._id;
    next();
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};
