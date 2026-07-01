import { Router } from 'express';
import authenticate from '../middleware/auth';
import { isAdmin } from '../middleware/admin';
import {
  getAdminStats,
  getAdminUsers,
  deleteAdminUser
} from '../controllers/adminController';

const router = Router();

router.use(authenticate);
router.use(isAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.delete('/users/:id', deleteAdminUser);

export default router;
