import type { Request, Response, NextFunction } from 'express';
import Task from '../models/Task';
import Subject from '../models/Subject';
import User from '../models/User';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const dayKey = (date: Date): string => {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export const getAnalyticsSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({ user: userId, completed: true });
    const subjects = await Subject.find({ user: userId });

    res.json({
      totalTasks,
      completedTasks,
      completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
      subjects: subjects.length
    });
  } catch (error) {
    next(error);
  }
};

export const getStreak = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compute the live streak from completed task timestamps so it reflects reality
    // even if the cached User.streak value is stale.
    const completed = await Task.find({ user: userId, completed: true }, { updatedAt: 1 })
      .sort({ updatedAt: -1 })
      .lean();

    const studyDays = new Set<string>();
    for (const task of completed) {
      const when = (task as any).updatedAt || (task as any).createdAt;
      if (when) studyDays.add(dayKey(new Date(when)));
    }

    let liveStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const probe = new Date(today.getTime() - i * MS_PER_DAY);
      if (studyDays.has(dayKey(probe))) {
        liveStreak += 1;
      } else if (i === 0) {
        // Allow the streak to survive a "rest" day at the very start — only
        // break it if the user has missed two consecutive days.
        continue;
      } else {
        break;
      }
    }

    const goalToday = (user.studyGoal ?? 2) * 60; // minutes

    if (liveStreak > (user.longestStreak ?? 0)) {
      user.longestStreak = liveStreak;
    }
    user.streak = liveStreak;
    user.lastStudyDate = new Date();
    await user.save();

    res.json({
      streak: liveStreak,
      goalToday,
      longestStreak: user.longestStreak
    });
  } catch (error) {
    next(error);
  }
};
