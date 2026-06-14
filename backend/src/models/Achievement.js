import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    achievementType: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Achievement = mongoose.model("Achievement", achievementSchema);
