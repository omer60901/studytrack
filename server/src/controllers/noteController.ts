import type { Request, Response, NextFunction } from 'express';
import Note from '../models/Note';

export const getNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const notes = await Note.find({ user: userId }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { title, content, subject } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    const note = await Note.create({ user: userId, title, content, subject });
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { title, content, subject } = req.body;
    const updates = { title, content, subject };
    Object.keys(updates).forEach((key) => {
      if (updates[key as keyof typeof updates] === undefined) delete updates[key as keyof typeof updates];
    });
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      updates,
      { returnDocument: 'after' }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};
