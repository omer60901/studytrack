import { Router } from 'express';
import {
  getSessions,
  createSession,
  createManualSession,
  updateSession,
  deleteSession,
  getSessionStats,
  getSessionTrends
} from '../controllers/studySessionController';
import authenticate from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/', getSessions);
router.post('/', createSession);
router.post('/manual', createManualSession);
router.patch('/:id', updateSession);
router.delete('/:id', deleteSession);
router.get('/stats', getSessionStats);
router.get('/trends', getSessionTrends);

export default router;
