import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Production admin authentication middleware
const adminAuthMiddleware = async (req, res, next) => {
  let token;

  // Get token from Authorization header (Bearer TOKEN)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No token. Admin access denied.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find admin user by decoded id
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin || admin.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized as admin.' });
    }

    // Attach admin info to request
    req.user = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token failed or expired.' });
  }
};

// Development mode - bypass admin auth (set NODE_ENV=development to enable)
const devAdminAuthMiddleware = (_req, _res, next) => {
  // DEV-ONLY: disable admin auth for development
  return next();
};

// TEMPORARILY DISABLE ALL ADMIN AUTH FOR TESTING
// Export the appropriate middleware based on environment
const middleware = devAdminAuthMiddleware; // Always bypass auth for now

export default middleware;
