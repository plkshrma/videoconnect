import express from 'express';
import {
    createInterview,
    getInterviews,
    getInterview,
    updateInterviewStatus,
    getStreamToken
} from '../controllers/interviewController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createInterview);
router.get('/', authenticateToken, getInterviews);
router.get('/:id', authenticateToken, getInterview);
router.put('/:id/status', authenticateToken, updateInterviewStatus);
router.get('/:callId/token', authenticateToken, getStreamToken);

export default router;