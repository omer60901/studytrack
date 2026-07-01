import { Router } from 'express';
import {
  getFlashcards, getDecks, getTags, createFlashcard,
  updateFlashcard, deleteFlashcard, bulkDeleteFlashcards,
  shuffleFlashcards, reviewFlashcard
} from '../controllers/flashcardController';
import authenticate from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/', getFlashcards);
router.get('/decks', getDecks);
router.get('/tags', getTags);
router.post('/', createFlashcard);
router.post('/bulk-delete', bulkDeleteFlashcards);
router.post('/shuffle', shuffleFlashcards);
router.post('/:id/review', reviewFlashcard);
router.put('/:id', updateFlashcard);
router.delete('/:id', deleteFlashcard);

export default router;
