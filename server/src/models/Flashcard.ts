import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    front: { type: String, required: true },
    back: { type: String, required: true },
    subject: { type: String, default: '' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [{ type: String }],
    order: { type: Number, default: 0 },
    lastReviewed: { type: Date },
    easeFactor: { type: Number, default: 2.5 },
    interval: { type: Number, default: 0 },
    repetitions: { type: Number, default: 0 },
    nextReview: { type: Date }
  },
  { timestamps: true }
);

flashcardSchema.index({ user: 1, subjectId: 1 });
flashcardSchema.index({ user: 1, tags: 1 });

const Flashcard = mongoose.model('Flashcard', flashcardSchema);
export default Flashcard;
