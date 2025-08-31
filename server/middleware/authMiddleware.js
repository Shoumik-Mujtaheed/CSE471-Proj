import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Check Authorization header for token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user to request object (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      
      // 🔥 FIX: Check if user exists
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      console.log('✅ Authenticated user:', req.user._id, req.user.email);
      next();
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // 🔥 FIX: This should be an else block, not separate if
    console.error('❌ No token provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
