import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastStudyDate: { type: Date },
    totalStudyHours: { type: Number, default: 0 },
    emailNotifications: { type: Boolean, default: true },
    studyGoal: { type: Number, default: 2 },
    achievedTodayMinutes: { type: Number, default: 0 },
    reminderPreferences: {
      studyReminder: { type: Boolean, default: true },
      deadlineReminder: { type: Boolean, default: true },
      reviewReminder: { type: Boolean, default: true },
      reminderTime: { type: String, default: '09:00' }
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
