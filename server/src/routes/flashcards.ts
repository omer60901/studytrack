import { Router } from 'express';
import { getFlashcards, createFlashcard, updateFlashcard, deleteFlashcard } from '../controllers/flashcardController';
import authenticate from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/', getFlashcards);
router.post('/', createFlashcard);
router.put('/:id', updateFlashcard);
router.delete('/:id', deleteFlashcard);

export default router;
