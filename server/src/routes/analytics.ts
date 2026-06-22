import { Router } from 'express';
import { getAnalyticsSummary, getStreak } from '../controllers/analyticsController';
import authenticate from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/summary', getAnalyticsSummary);
router.get('/streak', getStreak);

export default router;
