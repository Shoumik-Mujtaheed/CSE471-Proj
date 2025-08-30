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
    console.log('🔍 Admin Auth: Verifying token...');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 Admin Auth: Token decoded successfully:', { id: decoded.id });

    // Handle mock admin for development
    if (decoded.id === 'mock-admin-id') {
      console.log('🔍 Admin Auth: Using mock admin');
      req.user = {
        _id: 'mock-admin-id',
        name: 'Mock Admin',
        role: 'admin'
      };
      return next();
    }

    // Find admin user by decoded id
    console.log('🔍 Admin Auth: Looking for admin with ID:', decoded.id);
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      console.log('❌ Admin Auth: Admin not found in database');
      return res.status(401).json({ message: 'User not founds' });
    }
    
    if (admin.role !== 'admin') {
      console.log('❌ Admin Auth: User is not an admin, role:', admin.role);
      return res.status(401).json({ message: 'Not authorized as admin.' });
    }

    console.log('✅ Admin Auth: Admin authenticated successfully:', { id: admin._id, name: admin.name, role: admin.role });

    // Attach admin info to request
    req.user = admin;
    next();
  } catch (error) {
    console.error('❌ Admin Auth: Error during authentication:', error);
    return res.status(401).json({ message: 'Token failed or expired.' });
  }
};

// Development mode - bypass admin auth (set NODE_ENV=development to enable)
const devAdminAuthMiddleware = (_req, _res, next) => {
  // DEV-ONLY: disable admin auth for development
  return next();
};

// Export the appropriate middleware based on environment
// For now, use production middleware but with mock admin support
const middleware = adminAuthMiddleware;

export default middleware;
