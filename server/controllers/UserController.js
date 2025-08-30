import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, phoneNumber, role, bloodGroup, specialty } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      role,
      bloodGroup
    });

    if (user) {
      // If user registered as doctor, create doctor profile
      if (role === 'doctor') {
        try {
          const Doctor = (await import('../models/Doctor.js')).default;
          await Doctor.create({
            user: user._id,
            specialty: specialty || 'General Medicine'
          });
        } catch (docError) {
          console.log('Doctor profile creation error:', docError);
        }
      }

      // If user registered as staff, create staff profile
      if (role === 'staff') {
        try {
          const Staff = (await import('../models/Staff.js')).default;
          await Staff.create({
            user: user._id,
            department: 'General'
          });
        } catch (staffError) {
          console.log('Staff profile creation error:', staffError);
        }
      }

      // Determine next path based on role
      const getNextPath = (userRole) => {
        switch (userRole) {
          case 'doctor': return '/doctor/dashboard';
          case 'staff': return '/staff/dashboard';
          case 'patient': return '/patient-dashboard';
          default: return '/patient-dashboard';
        }
      };

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        token: generateToken(user._id),
        nextPath: getNextPath(user.role)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Determine next path based on role
      const getNextPath = (userRole) => {
        switch (userRole) {
          case 'doctor': return '/doctor/dashboard';
          case 'staff': return '/staff/dashboard';
          case 'patient': return '/patient-dashboard';
          default: return '/patient-dashboard';
        }
      };

      // Get additional profile info for doctors and staff
      let profileInfo = {};
      if (user.role === 'doctor') {
        try {
          const Doctor = (await import('../models/Doctor.js')).default;
          const doctorProfile = await Doctor.findOne({ user: user._id });
          if (doctorProfile) {
            profileInfo.specialty = doctorProfile.specialty;
            profileInfo.doctorId = doctorProfile._id;
          }
        } catch (error) {
          console.log('Error fetching doctor profile:', error);
        }
      } else if (user.role === 'staff') {
        try {
          const Staff = (await import('../models/Staff.js')).default;
          const staffProfile = await Staff.findOne({ user: user._id });
          if (staffProfile) {
            profileInfo.department = staffProfile.department;
            profileInfo.staffId = staffProfile._id;
          }
        } catch (error) {
          console.log('Error fetching staff profile:', error);
        }
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        token: generateToken(user._id),
        nextPath: getNextPath(user.role),
        ...profileInfo
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
