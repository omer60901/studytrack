import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { requireAuth } from "./middleware/auth.js";
import { aiRoutes } from "./routes/aiRoutes.js";
import { analyticsRoutes } from "./routes/analyticsRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { examRoutes, sessionRoutes, subjectRoutes, taskRoutes } from "./routes/resourceRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ 
  origin: ["http://localhost:5174", "http://127.0.0.1:5174"], 
  credentials: true 
}));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "StudyTrack" }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", requireAuth, taskRoutes);
app.use("/api/subjects", requireAuth, subjectRoutes);
app.use("/api/exams", requireAuth, examRoutes);
app.use("/api/study-sessions", requireAuth, sessionRoutes);
app.use("/api/analytics", requireAuth, analyticsRoutes);
app.use("/api/ai", requireAuth, aiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

await connectDB();
app.listen(port, () => console.log(`StudyTrack API running on port ${port}`));
