import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema({
  title: String,
  url: String,
  type: String
}, { _id: false });

const ScheduleSchema = new mongoose.Schema({
  day: String,
  focus: String,
  duration: String,
  techniques: [String],
  resources: [String],
  completed: { type: Boolean, default: false }
}, { _id: false });

const PlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goal: { type: String, required: true },
  deadline: { type: Date },
  difficultyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  totalDays: Number,
  estimatedHoursPerDay: Number,
  schedule: [ScheduleSchema],
  dailyGoals: [String],
  recommendations: [String],
  studyTechniques: [String],
  resources: [ResourceSchema]
}, { timestamps: true });

export default mongoose.model('Plan', PlanSchema);
