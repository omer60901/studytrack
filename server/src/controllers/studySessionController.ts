import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import StudySession from '../models/StudySession';
import { awardPomodoroCompletedXp, awardManualSessionXp } from '../utils/achievements';

export const getSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { page = '1', limit = '50', subject, mood, from, to, search } = req.query;

    const filter: Record<string, any> = { userId };

    if (subject) filter.subjectId = subject;
    if (mood) filter.mood = mood;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }
    if (search) {
      filter.$or = [
        { focusArea: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { learningOutcome: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const [sessions, total] = await Promise.all([
      StudySession.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      StudySession.countDocuments(filter)
    ]);

    res.json({
      data: sessions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { duration, focusArea, pomodoros, notes, mood, planId, subjectId, learningOutcome, difficulty, tags } = req.body;
    if (!duration) {
      return res.status(400).json({ message: 'Duration is required' });
    }
    const session = await StudySession.create({
      userId,
      duration,
      focusArea,
      subjectId: subjectId || undefined,
      planId: planId || undefined,
      pomodoros: pomodoros || 0,
      notes,
      mood,
      learningOutcome,
      difficulty,
      tags: tags || [],
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

export const createManualSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { duration, focusArea, subjectId, notes, mood, learningOutcome, difficulty, tags, planId, date } = req.body;
    if (!duration) {
      return res.status(400).json({ message: 'Duration is required' });
    }
    const session = await StudySession.create({
      userId,
      duration,
      focusArea,
      subjectId: subjectId || undefined,
      planId: planId || undefined,
      notes,
      mood,
      learningOutcome,
      difficulty,
      tags: tags || [],
      pomodoros: 0,
      completedAt: date ? new Date(date) : new Date(),
      createdAt: date ? new Date(date) : new Date()
    });
    res.status(201).json(session);

    try {
      await awardManualSessionXp(new mongoose.Types.ObjectId(userId), duration);
    } catch { /* silent */ }
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { duration, focusArea, pomodoros, notes, mood, learningOutcome, difficulty, tags, subjectId, planId } = req.body;

    const session = await StudySession.findOneAndUpdate(
      { _id: req.params.id, userId },
      {
        ...(duration !== undefined && { duration }),
        ...(focusArea !== undefined && { focusArea }),
        ...(pomodoros !== undefined && { pomodoros }),
        ...(notes !== undefined && { notes }),
        ...(mood !== undefined && { mood }),
        ...(learningOutcome !== undefined && { learningOutcome }),
        ...(difficulty !== undefined && { difficulty }),
        ...(tags !== undefined && { tags }),
        ...(subjectId !== undefined && { subjectId }),
        ...(planId !== undefined && { planId })
      },
      { new: true }
    );

    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
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

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthMinutes = sessions
      .filter((s) => new Date(s.createdAt) >= monthAgo)
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    const bySubject: Record<string, number> = {};
    sessions.forEach((s) => {
      if (s.focusArea) {
        bySubject[s.focusArea] = (bySubject[s.focusArea] || 0) + (s.duration || 0);
      }
    });

    const byMood: Record<string, number> = {};
    sessions.forEach((s) => {
      if (s.mood) {
        byMood[s.mood] = (byMood[s.mood] || 0) + 1;
      }
    });

    const avgDifficulty = sessions.filter((s) => s.difficulty).length > 0
      ? sessions.filter((s) => s.difficulty).reduce((sum, s) => sum + (s.difficulty || 0), 0) /
        sessions.filter((s) => s.difficulty).length
      : 0;

    const dailyStats: Record<string, number> = {};
    sessions.forEach((s) => {
      const day = new Date(s.createdAt).toISOString().split('T')[0];
      dailyStats[day] = (dailyStats[day] || 0) + (s.duration || 0);
    });

    const thisWeek = sessions.filter((s) => new Date(s.createdAt) >= weekAgo);
    const lastWeekStart = new Date(weekAgo);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeek = sessions.filter((s) => {
      const d = new Date(s.createdAt);
      return d >= lastWeekStart && d < weekAgo;
    });
    const thisWeekMinutes = thisWeek.reduce((sum, s) => sum + (s.duration || 0), 0);
    const lastWeekMinutes = lastWeek.reduce((sum, s) => sum + (s.duration || 0), 0);
    const weekOverWeekChange = lastWeekMinutes > 0
      ? Math.round(((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100)
      : thisWeekMinutes > 0 ? 100 : 0;

    const tags: Record<string, number> = {};
    sessions.forEach((s) => {
      (s.tags || []).forEach((tag) => {
        tags[tag] = (tags[tag] || 0) + 1;
      });
    });

    res.json({
      totalMinutes,
      totalPomodoros,
      totalSessions,
      todayMinutes,
      weekMinutes,
      monthMinutes,
      bySubject,
      byMood,
      avgDifficulty: Math.round(avgDifficulty * 10) / 10,
      dailyStats,
      weekOverWeekChange,
      tags
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionTrends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { period = '7' } = req.query;
    const days = parseInt(period as string);

    const sessions = await StudySession.find({ userId }).sort({ createdAt: -1 });

    const trends: Array<{ date: string; minutes: number; sessions: number; pomodoros: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const daySessions = sessions.filter((s) => {
        const sd = new Date(s.createdAt);
        return sd >= dayStart && sd <= dayEnd;
      });

      trends.push({
        date: dayStr,
        minutes: daySessions.reduce((sum, s) => sum + (s.duration || 0), 0),
        sessions: daySessions.length,
        pomodoros: daySessions.reduce((sum, s) => sum + (s.pomodoros || 0), 0)
      });
    }

    res.json(trends);
  } catch (error) {
    next(error);
  }
};
