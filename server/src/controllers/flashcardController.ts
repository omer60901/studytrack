import type { Request, Response, NextFunction } from 'express';
import Flashcard from '../models/Flashcard';

export const getFlashcards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const cards = await Flashcard.find({ user: userId }).sort({ createdAt: -1 });
    res.json(cards);
  } catch (error) {
    next(error);
  }
};

export const createFlashcard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { front, back, subject, difficulty } = req.body;
    if (!front || !back) {
      return res.status(400).json({ message: 'Front and back are required' });
    }
    const card = await Flashcard.create({ user: userId, front, back, subject, difficulty });
    res.status(201).json(card);
  } catch (error) {
    next(error);
  }
};

export const updateFlashcard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { front, back, subject, difficulty } = req.body;
    const updates = { front, back, subject, difficulty };
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
