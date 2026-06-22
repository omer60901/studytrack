import { Router } from 'express';
import { createPlan, getUserPlans, getPlanById, updatePlanProgress, deletePlan } from '../controllers/plannerController';
import authenticate from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.post('/', createPlan);
router.get('/', getUserPlans);
router.get('/:id', getPlanById);
router.patch('/:id/progress', updatePlanProgress);
router.delete('/:id', deletePlan);

export default router;
