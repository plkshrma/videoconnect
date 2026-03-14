import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile/:clerkId', authenticateToken, getUserProfile);
router.put('/profile/:clerkId', authenticateToken, updateUserProfile);

export default router;