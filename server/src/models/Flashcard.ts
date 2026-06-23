import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    front: { type: String, required: true },
    back: { type: String, required: true },
    subject: { type: String, default: '' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    lastReviewed: { type: Date },
    easeFactor: { type: Number, default: 2.5 },
    interval: { type: Number, default: 0 },
    repetitions: { type: Number, default: 0 },
    nextReview: { type: Date }
  },
  { timestamps: true }
);

const Flashcard = mongoose.model('Flashcard', flashcardSchema);
export default Flashcard;
