# StudyTrack

StudyTrack is a full-stack student productivity platform with task management, exams, focus sessions, analytics, gamification, AI study planning, dark/light mode, and English/Hebrew language support.

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router, TanStack Query, Axios, React Hook Form, React Hot Toast, Framer Motion, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, OpenAI API

## Quick Start

```bash
npm run install:all
```

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/studytrack
JWT_SECRET=replace-with-a-long-random-secret
OPENAI_API_KEY=
CLIENT_ORIGIN=http://localhost:5173
```

Create `client/.env` if your API URL is different:

```env
VITE_API_URL=http://localhost:5000/api
```

Run both apps:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

The AI planner works with `OPENAI_API_KEY`. Without it, the backend returns a high-quality local fallback plan.

## MongoDB Users

User registration and login are already implemented through MongoDB. To connect your server, put your MongoDB connection string in `server/.env` as `MONGODB_URI`, then run the backend. Do not commit real credentials.
