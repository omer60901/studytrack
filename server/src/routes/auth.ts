import { Router } from 'express';
import { login, register, profile, updateProfile, changePassword, deleteAccount } from '../controllers/authController';
import authenticate from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/profile', authenticate, profile);
router.patch('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);
router.delete('/account', authenticate, deleteAccount);

export default router;
