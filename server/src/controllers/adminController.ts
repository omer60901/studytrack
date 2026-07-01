import type { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import StudySession from '../models/StudySession';
import Task from '../models/Task';
import Subject from '../models/Subject';
import Note from '../models/Note';
import Flashcard from '../models/Flashcard';
import Event from '../models/Event';
import Plan from '../models/Plan';

export const getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalSessions, sessionStats] = await Promise.all([
      User.countDocuments(),
      StudySession.countDocuments(),
      StudySession.aggregate([
        { $group: { _id: null, totalMinutes: { $sum: '$duration' } } }
      ])
    ]);

    const totalMinutes = sessionStats[0]?.totalMinutes || 0;

    res.json({ totalUsers, totalSessions, totalMinutes });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const sessionCount = await StudySession.countDocuments({ userId: user._id });
        const totalMinutes = await StudySession.aggregate([
          { $match: { userId: user._id } },
          { $group: { _id: null, total: { $sum: '$duration' } } }
        ]);

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          level: user.level,
          xp: user.xp,
          createdAt: user.createdAt,
          sessionCount,
          totalMinutes: totalMinutes[0]?.total || 0
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    next(error);
  }
};

export const deleteAdminUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Promise.all([
      User.findByIdAndDelete(id),
      StudySession.deleteMany({ userId: id }),
      Task.deleteMany({ userId: id }),
      Subject.deleteMany({ userId: id }),
      Note.deleteMany({ userId: id }),
      Flashcard.deleteMany({ userId: id }),
      Event.deleteMany({ userId: id }),
      Plan.deleteMany({ userId: id })
    ]);

    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};
