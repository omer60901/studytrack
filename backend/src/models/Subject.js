import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: "#7C3AED" },
    icon: { type: String, default: "BookOpen" },
    averageGrade: { type: Number, default: 0 },
    progressPercentage: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Subject = mongoose.model("Subject", subjectSchema);
