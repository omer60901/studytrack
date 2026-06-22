import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    title: { type: String, required: true, trim: true },
    examDate: { type: Date, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    preparationStatus: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Exam = mongoose.model("Exam", examSchema);
