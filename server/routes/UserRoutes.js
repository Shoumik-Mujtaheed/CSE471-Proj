import express from 'express';
import { registerUser, loginUser, getUserProfile, getCurrentUser } from '../controllers/UserController.js';
import { protect } from '../middleware/authMiddleware.js';
import {userAuth} from '../middleware/userAuthMiddleware.js'

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile);
router.get('/me', userAuth(), getCurrentUser);

export default router;
