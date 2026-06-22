import { Router } from 'express';
import { getSessions, createSession, deleteSession, getSessionStats } from '../controllers/studySessionController';
import authenticate from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/', getSessions);
router.post('/', createSession);
router.delete('/:id', deleteSession);
router.get('/stats', getSessionStats);

export default router;
