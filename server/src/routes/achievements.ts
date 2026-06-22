import { Router } from 'express';
import auth from '../middleware/auth';
import Achievement from '../models/Achievement';

const router = Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const achievements = await Achievement.find({ user: req.user!.id }).sort({ unlockedAt: -1 });
    res.json(achievements);
  } catch (error) {
    next(error);
  }
});

export default router;
