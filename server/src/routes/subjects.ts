import { Router } from 'express';
import {
  createSubject,
  deleteSubject,
  getSubjects,
  getSubjectById,
  updateSubject
} from '../controllers/subjectController';
import authenticate from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getSubjects);
router.post('/', createSubject);
router.get('/:id', getSubjectById);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

export default router;
