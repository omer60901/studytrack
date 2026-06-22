import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    color: { type: String, default: '#7c3aed' },
    icon: { type: String, default: '📘' },
    progress: { type: Number, default: 0 },
    gradeAverage: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
