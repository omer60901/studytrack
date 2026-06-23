import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import StudySession from '../models/StudySession';
import { awardPomodoroCompletedXp } from '../utils/achievements';

export const getSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const sessions = await StudySession.find({ userId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { duration, focusArea, pomodoros, notes, mood } = req.body;
    if (!duration) {
      return res.status(400).json({ message: 'Duration is required' });
    }
    const session = await StudySession.create({
      userId,
      duration,
      focusArea,
      pomodoros: pomodoros || 0,
      notes,
      mood,
      completedAt: new Date()
    });
    res.status(201).json(session);

    if (pomodoros && pomodoros > 0) {
      try {
        await awardPomodoroCompletedXp(new mongoose.Types.ObjectId(userId));
      } catch { /* silent */ }
    }
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const session = await StudySession.findOneAndDelete({ _id: req.params.id, userId });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted' });
  } catch (error) {
    next(error);
  }
};

export const getSessionStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const sessions = await StudySession.find({ userId }).sort({ createdAt: -1 });

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalPomodoros = sessions.reduce((sum, s) => sum + (s.pomodoros || 0), 0);
    const totalSessions = sessions.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMinutes = sessions
      .filter((s) => new Date(s.createdAt) >= today)
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekMinutes = sessions
      .filter((s) => new Date(s.createdAt) >= weekAgo)
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    const bySubject: Record<string, number> = {};
    sessions.forEach((s) => {
      if (s.focusArea) {
        bySubject[s.focusArea] = (bySubject[s.focusArea] || 0) + (s.duration || 0);
      }
    });

    res.json({ totalMinutes, totalPomodoros, totalSessions, todayMinutes, weekMinutes, bySubject });
  } catch (error) {
    next(error);
  }
};
