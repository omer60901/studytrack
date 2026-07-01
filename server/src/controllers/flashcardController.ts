import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Flashcard from '../models/Flashcard';
import { awardFlashcardCreatedXp, awardFlashcardReviewedXp } from '../utils/achievements';

export const getFlashcards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const filter: Record<string, unknown> = { user: userId };
    if (req.query.subjectId) {
      filter.subjectId = req.query.subjectId;
    }
    if (req.query.tag) {
      filter.tags = { $in: [req.query.tag] };
    }
    if (req.query.review === 'true') {
      filter.nextReview = { $lte: new Date() };
    }
    const cards = await Flashcard.find(filter).sort({ order: 1, createdAt: -1 }).populate('subjectId', 'name color');
    res.json(cards);
  } catch (error) {
    next(error);
  }
};

export const getDecks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const cards = await Flashcard.find({ user: userId }).populate('subjectId', 'name color');

    const deckMap = new Map<string, { name: string; color: string; cards: number; due: number }>();

    for (const card of cards) {
      const key = card.subjectId ? String(card.subjectId._id) : (card.subject || 'Uncategorized');
      const name = card.subjectId ? (card.subjectId as any).name : (card.subject || 'Uncategorized');
      const color = card.subjectId ? (card.subjectId as any).color : '#6366f1';
      const existing = deckMap.get(key) || { name, color, cards: 0, due: 0 };
      existing.cards++;
      if (card.nextReview && new Date(card.nextReview) <= new Date()) {
        existing.due++;
      }
      deckMap.set(key, existing);
    }

    const decks = Array.from(deckMap.entries()).map(([id, data]) => ({
      id,
      ...data
    }));

    res.json(decks);
  } catch (error) {
    next(error);
  }
};

export const getTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const cards = await Flashcard.find({ user: userId }).select('tags');
    const tagSet = new Set<string>();
    cards.forEach((c) => (c.tags || []).forEach((t) => tagSet.add(t)));
    res.json(Array.from(tagSet).sort());
  } catch (error) {
    next(error);
  }
};

export const createFlashcard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { front, back, subject, subjectId, difficulty, tags } = req.body;
    if (!front || !back) {
      return res.status(400).json({ message: 'Front and back are required' });
    }
    const card = await Flashcard.create({
      user: userId, front, back, subject, subjectId, difficulty,
      tags: tags || []
    });
    res.status(201).json(card);

    try {
      await awardFlashcardCreatedXp(new mongoose.Types.ObjectId(userId));
    } catch { /* silent */ }
  } catch (error) {
    next(error);
  }
};

export const updateFlashcard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { front, back, subject, subjectId, difficulty, tags, order } = req.body;
    const updates: Record<string, unknown> = {};
    if (front !== undefined) updates.front = front;
    if (back !== undefined) updates.back = back;
    if (subject !== undefined) updates.subject = subject;
    if (subjectId !== undefined) updates.subjectId = subjectId;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (tags !== undefined) updates.tags = tags;
    if (order !== undefined) updates.order = order;

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

export const bulkDeleteFlashcards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Array of IDs is required' });
    }
    await Flashcard.deleteMany({ _id: { $in: ids }, user: userId });
    res.json({ message: `${ids.length} flashcards deleted` });
  } catch (error) {
    next(error);
  }
};

export const shuffleFlashcards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { subjectId } = req.body;
    const filter: Record<string, unknown> = { user: userId };
    if (subjectId) filter.subjectId = subjectId;

    const cards = await Flashcard.find(filter);
    const shuffled = cards.sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i++) {
      await Flashcard.findByIdAndUpdate(shuffled[i]._id, { order: i });
    }

    const updated = await Flashcard.find(filter).sort({ order: 1 }).populate('subjectId', 'name color');
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const reviewFlashcard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { quality } = req.body;
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

    try {
      await awardFlashcardReviewedXp(new mongoose.Types.ObjectId(userId));
    } catch { /* silent */ }
  } catch (error) {
    next(error);
  }
};
