import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTasks,
  getTaskById,
  updateTask
} from '../controllers/taskController';
import authenticate from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
