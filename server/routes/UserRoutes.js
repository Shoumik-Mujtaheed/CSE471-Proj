import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/UserController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile);

export default router;
