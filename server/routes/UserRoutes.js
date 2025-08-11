import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/UserController.js';
import { protect, userAuth } from '../middleware/authMiddleware.js';


const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile);
router.get('/me', userAuth(), getCurrentUser);

export default router;
