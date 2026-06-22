import type { Request, Response, NextFunction } from 'express';
import Event from '../models/Event';

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const events = await Event.find({ user: userId }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const event = await Event.findOne({ _id: req.params.id, user: userId });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const event = await Event.create({ ...req.body, user: userId });
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { title, description, date, type, subject, recurrence, recurrenceEnd } = req.body;
    const updates = { title, description, date, type, subject, recurrence, recurrenceEnd };
    Object.keys(updates).forEach((key) => {
      if (updates[key as keyof typeof updates] === undefined) {
        delete updates[key as keyof typeof updates];
      }
    });
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      updates,
      { returnDocument: 'after' }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const event = await Event.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};
