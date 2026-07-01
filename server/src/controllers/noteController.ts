import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Note from '../models/Note';
import { awardNoteCreatedXp } from '../utils/achievements';

export const getNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const filter: Record<string, unknown> = { user: userId };
    if (req.query.subjectId) {
      filter.subjectId = req.query.subjectId;
    }
    const notes = await Note.find(filter).sort({ updatedAt: -1 }).populate('subjectId', 'name color');
    res.json(notes);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { title, content, subject, subjectId } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    const note = await Note.create({ user: userId, title, content, subject, subjectId });
    res.status(201).json(note);

    try {
      await awardNoteCreatedXp(new mongoose.Types.ObjectId(userId));
    } catch { /* silent */ }
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { title, content, subject, subjectId } = req.body;
    const updates = { title, content, subject, subjectId };
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
