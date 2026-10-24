import { Router } from 'express';
import { signup, login, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);

export default router;

