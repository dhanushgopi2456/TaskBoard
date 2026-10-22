import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
