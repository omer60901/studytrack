import { Router } from 'express';
import { login, register, profile, updateProfile, changePassword } from '../controllers/authController';
import authenticate from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/profile', authenticate, profile);
router.patch('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);

export default router;
