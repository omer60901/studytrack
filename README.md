# StudyTrack

StudyTrack is a modern productivity platform for students, built as a full-stack application with React, Vite, Tailwind CSS, Node.js, Express, and MongoDB.

## Structure

- `client/` — React frontend with Vite, Tailwind CSS, React Router, and Framer Motion
- `server/` — Express backend with MongoDB, Mongoose, JWT authentication, and planner APIs

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```

2. Start both apps
   ```bash
   npm run dev
   ```

3. Configure backend env
   - Copy `server/.env.example` to `server/.env`
   - Set `MONGO_URI`, `JWT_SECRET`, and `PORT`
   - Use your MongoDB connection string in `MONGO_URI`
