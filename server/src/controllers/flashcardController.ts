import type { Request, Response, NextFunction } from 'express';
import Flashcard from '../models/Flashcard';

export const getFlashcards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const filter: Record<string, unknown> = { user: userId };
    if (req.query.subjectId) {
      filter.subjectId = req.query.subjectId;
    }
    if (req.query.review === 'true') {
      filter.nextReview = { $lte: new Date() };
    }
    const cards = await Flashcard.find(filter).sort({ createdAt: -1 }).populate('subjectId', 'name color');
    res.json(cards);
  } catch (error) {
    next(error);
  }
};

export const createFlashcard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { front, back, subject, subjectId, difficulty } = req.body;
    if (!front || !back) {
      return res.status(400).json({ message: 'Front and back are required' });
    }
    const card = await Flashcard.create({ user: userId, front, back, subject, subjectId, difficulty });
    res.status(201).json(card);
  } catch (error) {
    next(error);
  }
};

export const updateFlashcard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { front, back, subject, subjectId, difficulty } = req.body;
    const updates = { front, back, subject, subjectId, difficulty };
    Object.keys(updates).forEach((key) => {
      if (updates[key as keyof typeof updates] === undefined) delete updates[key as keyof typeof updates];
    });
    const card = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      updates,
      { returnDocument: 'after' }
    );
    if (!card) return res.status(404).json({ message: 'Flashcard not found' });
    res.json(card);
  } catch (error) {
    next(error);
  }
};

export const deleteFlashcard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const card = await Flashcard.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!card) return res.status(404).json({ message: 'Flashcard not found' });
    res.json({ message: 'Flashcard deleted' });
  } catch (error) {
    next(error);
  }
};

export const reviewFlashcard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { quality } = req.body; // 0-5 rating
    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({ message: 'Quality rating 0-5 is required' });
    }

    const card = await Flashcard.findOne({ _id: req.params.id, user: userId });
    if (!card) return res.status(404).json({ message: 'Flashcard not found' });

    let { easeFactor, interval, repetitions } = card;

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

    const updated = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      {
        easeFactor: Math.round(easeFactor * 100) / 100,
        interval,
        repetitions,
        nextReview,
        lastReviewed: new Date()
      },
      { returnDocument: 'after' }
    );

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
