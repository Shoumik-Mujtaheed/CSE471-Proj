// server/controllers/adminController.js

import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// POST /api/admin/login
export const adminLogin = async (req, res) => {
  const { name, password } = req.body;  // must match frontend and DB
  try {
    const admin = await Admin.findOne({ name });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: admin._id, name: admin.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({ token, name: admin.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

