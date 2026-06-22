/// <reference path="./types/express.d.ts" />
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDatabase from './config/db';
import app from './app';

dotenv.config();
const port = Number(process.env.SERVER_PORT ?? process.env.PORT ?? 5000);

connectDatabase().then((connected) => {
  if (connected) {
    console.log('Database connected');
  } else {
    console.warn('Database not connected — running without DB');
  }
  const server = app.listen(port, () => {
    console.log(`StudyTrack server listening on http://localhost:${port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await mongoose.connection.close(false);
      console.log('Server shut down.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
});
