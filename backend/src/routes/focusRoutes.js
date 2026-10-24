import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  recordFocusSession,
  getFocusSessions,
  getFocusStats,
} from '../controllers/focusController.js';

const router = express.Router();

// All focus routes require authentication
router.use(authenticateToken);

router.post('/sessions', recordFocusSession);
router.get('/sessions', getFocusSessions);
router.get('/stats', getFocusStats);

export default router;
