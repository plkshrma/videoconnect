import express from 'express';
import {
    createQuestion,
    getQuestions,
    getQuestion,
    updateQuestion,
    deleteQuestion
} from '../controllers/questionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createQuestion);
router.get('/', authenticateToken, getQuestions);
router.get('/:id', authenticateToken, getQuestion);
router.put('/:id', authenticateToken, updateQuestion);
router.delete('/:id', authenticateToken, deleteQuestion);

export default router;