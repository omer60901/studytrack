import mongoose from 'mongoose';

const StudySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  duration: { type: Number, required: true },
  focusArea: { type: String },
  pomodoros: { type: Number, default: 0 },
  notes: String,
  mood: { type: String, enum: ['great', 'good', 'okay', 'tired'] },
  learningOutcome: { type: String },
  difficulty: { type: Number, min: 1, max: 5 },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

StudySessionSchema.index({ userId: 1, createdAt: -1 });
StudySessionSchema.index({ userId: 1, subjectId: 1 });
StudySessionSchema.index({ userId: 1, mood: 1 });

export default mongoose.model('StudySession', StudySessionSchema);
