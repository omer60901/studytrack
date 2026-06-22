import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    duration: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

export const StudySession = mongoose.model("StudySession", studySessionSchema);
