import type { Request, Response, NextFunction } from 'express';
import Subject from '../models/Subject';

export const getSubjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const subjects = await Subject.find({ user: userId }).sort({ title: 1 });
    res.json(subjects);
  } catch (error) {
    next(error);
  }
};

export const getSubjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const subject = await Subject.findOne({ _id: req.params.id, user: userId });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const subject = await Subject.create({ ...req.body, user: userId });
    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { title, color, icon, progress, gradeAverage } = req.body;
    const allowedColors = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#8b5cf6', '#0891b2', '#c026d3', '#ea580c', '#4f46e5', '#0d9488', '#be123c'];
    const updates = { title, color: allowedColors.includes(color) ? color : undefined, icon, progress, gradeAverage };
    Object.keys(updates).forEach((key) => {
      if (updates[key as keyof typeof updates] === undefined) {
        delete updates[key as keyof typeof updates];
      }
    });
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      updates,
      { returnDocument: 'after' }
    );
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    next(error);
  }
};
