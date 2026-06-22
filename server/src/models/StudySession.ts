import mongoose from 'mongoose';

const StudySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  duration: { type: Number, required: true },
  focusArea: { type: String },
  pomodoros: { type: Number, default: 0 },
  notes: String,
  mood: { type: String, enum: ['great', 'good', 'okay', 'tired'] },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export default mongoose.model('StudySession', StudySessionSchema);
