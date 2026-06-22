import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    front: { type: String, required: true },
    back: { type: String, required: true },
    subject: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    lastReviewed: { type: Date }
  },
  { timestamps: true }
);

const Flashcard = mongoose.model('Flashcard', flashcardSchema);
export default Flashcard;
