import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app';
import connectDatabase from '../src/config/db';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  await connectDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

test('register and login flow', async () => {
  const email = `test+${Date.now()}@example.com`;
  const password = 'Password123!';

  const reg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test User', email, password })
    .expect(201);

  expect(reg.body.user.email).toBe(email);

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  expect(login.body).toHaveProperty('token');
});
