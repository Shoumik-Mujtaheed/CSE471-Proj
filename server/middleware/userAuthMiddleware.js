// server/middleware/userAuthMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const userAuth = (requiredRole) => {
  return async (req, res, next) => {
    let token;

    // Check Authorization header for token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request object (excluding password)
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
          return res.status(401).json({ message: 'User not found' });
        }

        // Check role if specified
        if (requiredRole && req.user.role !== requiredRole) {
          return res.status(403).json({ 
            message: `Access denied. ${requiredRole} role required.` 
          });
        }

        next();
      } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
    } else {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
  };
};

// Alternative: Export a general auth function without role requirement
export const authenticate = userAuth();
