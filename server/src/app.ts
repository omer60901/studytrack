/// <reference path="./types/express.d.ts" />
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import subjectRoutes from './routes/subjects';
import calendarRoutes from './routes/calendar';
import analyticsRoutes from './routes/analytics';
import plannerRoutes from './routes/planner';
import flashcardRoutes from './routes/flashcards';
import noteRoutes from './routes/notes';
import studySessionRoutes from './routes/studySessions';
import achievementRoutes from './routes/achievements';
import errorHandler from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/study-sessions', studySessionRoutes);
app.use('/api/achievements', achievementRoutes);

app.get('/api/ping', (req, res) => {
  res.json({ message: 'StudyTrack server is running' });
});

app.use(errorHandler);

export default app;
