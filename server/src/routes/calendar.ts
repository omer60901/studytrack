import { Router } from 'express';
import {
  createEvent,
  deleteEvent,
  getEvents,
  getEventById,
  updateEvent
} from '../controllers/calendarController';
import authenticate from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getEvents);
router.post('/', createEvent);
router.get('/:id', getEventById);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
