import mongoose from 'mongoose';
import Achievement from '../models/Achievement';
import Task from '../models/Task';
import StudySession from '../models/StudySession';
import User from '../models/User';

const BADGES = [
  { id: 'first_task', name: 'First Step', description: 'Completed your first task', icon: '🎯' },
  { id: 'task_5', name: 'Getting Started', description: 'Completed 5 tasks', icon: '✅' },
  { id: 'task_10', name: 'On a Roll', description: 'Completed 10 tasks', icon: '🔥' },
  { id: 'task_25', name: 'Powerhouse', description: 'Completed 25 tasks', icon: '💪' },
  { id: 'task_50', name: 'Unstoppable', description: 'Completed 50 tasks', icon: '🏆' },
  { id: 'streak_3', name: 'Consistent', description: '3-day study streak', icon: '📅' },
  { id: 'streak_7', name: 'Weekly Warrior', description: '7-day study streak', icon: '⚔️' },
  { id: 'streak_30', name: 'Monthly Master', description: '30-day study streak', icon: '👑' },
  { id: 'study_60', name: 'Hour Scholar', description: 'Studied for 60+ minutes in a day', icon: '📚' },
  { id: 'study_300', name: 'Deep Focus', description: 'Studied for 5+ hours total', icon: '🧠' },
  { id: 'pomodoro_10', name: 'Focused', description: 'Completed 10 pomodoro sessions', icon: '🍅' },
  { id: 'subjects_3', name: 'Well Rounded', description: 'Studied 3+ different subjects', icon: '🎓' },
];

const XP_REWARDS = {
  taskCompleted: 10,
  pomodoroCompleted: 5,
  badgeEarned: 25,
  flashcardCreated: 2,
  flashcardReviewed: 1,
  noteCreated: 3,
  manualSession: 5,
};

async function awardXp(userId: mongoose.Types.ObjectId, amount: number): Promise<{ xp: number; level: number; leveledUp: boolean }> {
  const user = await User.findById(userId);
  if (!user) return { xp: 0, level: 1, leveledUp: false };

  const oldLevel = user.level ?? 1;
  user.xp = (user.xp ?? 0) + amount;
  user.level = Math.floor(user.xp / 100) + 1;
  const leveledUp = user.level > oldLevel;
  await user.save();

  return { xp: user.xp, level: user.level, leveledUp };
}

export async function checkAndAwardBadges(userId: mongoose.Types.ObjectId) {
  const newBadges: typeof BADGES = [];

  const completedTasks = await Task.countDocuments({ user: userId, completed: true });
  const taskThresholds = [
    { count: 1, id: 'first_task' },
    { count: 5, id: 'task_5' },
    { count: 10, id: 'task_10' },
    { count: 25, id: 'task_25' },
    { count: 50, id: 'task_50' },
  ];

  for (const { count, id } of taskThresholds) {
    if (completedTasks >= count) {
      const badge = BADGES.find((b) => b.id === id);
      if (badge) {
        const existing = await Achievement.findOne({ user: userId, badgeId: id });
        if (!existing) {
          await Achievement.create({ user: userId, ...badge });
          newBadges.push(badge);
        }
      }
    }
  }

  const sessions = await StudySession.find({ userId }).sort({ createdAt: 1 });
  const totalPomodoros = sessions.reduce((sum, s) => sum + (s.pomodoros || 0), 0);
  if (totalPomodoros >= 10) {
    const badge = BADGES.find((b) => b.id === 'pomodoro_10');
    if (badge) {
      const existing = await Achievement.findOne({ user: userId, badgeId: 'pomodoro_10' });
      if (!existing) {
        await Achievement.create({ user: userId, ...badge });
        newBadges.push(badge);
      }
    }
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const studyThresholds = [
    { minutes: 60, id: 'study_60' },
    { minutes: 300, id: 'study_300' },
  ];
  for (const { minutes, id } of studyThresholds) {
    if (totalMinutes >= minutes) {
      const badge = BADGES.find((b) => b.id === id);
      if (badge) {
        const existing = await Achievement.findOne({ user: userId, badgeId: id });
        if (!existing) {
          await Achievement.create({ user: userId, ...badge });
          newBadges.push(badge);
        }
      }
    }
  }

  const subjects = new Set(sessions.filter((s) => s.focusArea).map((s) => s.focusArea));
  if (subjects.size >= 3) {
    const badge = BADGES.find((b) => b.id === 'subjects_3');
    if (badge) {
      const existing = await Achievement.findOne({ user: userId, badgeId: 'subjects_3' });
      if (!existing) {
        await Achievement.create({ user: userId, ...badge });
        newBadges.push(badge);
      }
    }
  }

  return newBadges;
}

export async function awardTaskCompletedXp(userId: mongoose.Types.ObjectId) {
  return awardXp(userId, XP_REWARDS.taskCompleted);
}

export async function awardPomodoroCompletedXp(userId: mongoose.Types.ObjectId) {
  return awardXp(userId, XP_REWARDS.pomodoroCompleted);
}

export async function awardBadgeXp(userId: mongoose.Types.ObjectId) {
  return awardXp(userId, XP_REWARDS.badgeEarned);
}

export async function awardFlashcardCreatedXp(userId: mongoose.Types.ObjectId) {
  return awardXp(userId, XP_REWARDS.flashcardCreated);
}

export async function awardFlashcardReviewedXp(userId: mongoose.Types.ObjectId) {
  return awardXp(userId, XP_REWARDS.flashcardReviewed);
}

export async function awardNoteCreatedXp(userId: mongoose.Types.ObjectId) {
  return awardXp(userId, XP_REWARDS.noteCreated);
}

export async function awardManualSessionXp(userId: mongoose.Types.ObjectId, durationMinutes: number) {
  const xp = Math.floor(durationMinutes / 30) * XP_REWARDS.manualSession;
  if (xp > 0) {
    return awardXp(userId, xp);
  }
  return { xp: 0, level: 1, leveledUp: false };
}
