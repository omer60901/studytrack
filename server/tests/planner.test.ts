import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app';
import connectDatabase from '../src/config/db';
import User from '../src/models/User';
import Task from '../src/models/Task';

let mongod: MongoMemoryServer;
let token: string;
let userId: string;

const register = async (email: string) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Tester', email, password: 'Password123!' })
    .expect(201);
  return res.body;
};

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.NODE_ENV = 'test';
  await connectDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Task.deleteMany({});
  const body = await register(`user+${Date.now()}-${Math.random()}@example.com`);
  token = body.token;
  userId = body.user.id;
});

const authed = (req: request.Test) => req.set('Authorization', `Bearer ${token}`);

describe('auth validation', () => {
  test('rejects short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Tester', email: 'short@example.com', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Password must be at least/);
  });

  test('rejects bad email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Tester', email: 'not-an-email', password: 'Password123!' });
    expect(res.status).toBe(400);
  });

  test('rejects short name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'X', email: 'ok@example.com', password: 'Password123!' });
    expect(res.status).toBe(400);
  });

  test('rejects duplicate email with 409', async () => {
    const email = `dup+${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ name: 'Alice', email, password: 'Password123!' }).expect(201);
    const res = await request(app).post('/api/auth/register').send({ name: 'Bob', email, password: 'Password123!' });
    expect(res.status).toBe(409);
  });

  test('normalizes email case on login', async () => {
    const email = `Case+${Date.now()}@Example.com`;
    await request(app).post('/api/auth/register').send({ name: 'Alice', email, password: 'Password123!' }).expect(201);
    const res = await request(app).post('/api/auth/login').send({ email: email.toLowerCase(), password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});

describe('task ownership', () => {
  test('user cannot read another user\'s task', async () => {
    // Create a task as user A
    const aEmail = `a+${Date.now()}@example.com`;
    const a = await request(app).post('/api/auth/register').send({ name: 'Alice', email: aEmail, password: 'Password123!' }).expect(201);
    const aToken = a.body.token;
    const aUserId = a.body.user.id;
    const task = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${aToken}`)
      .send({ title: 'A task', category: 'x', priority: 'medium' })
      .expect(201);

    // sanity: ensure A and B are different users
    expect(aUserId).not.toBe(userId);

    // User B (token from beforeEach) tries to read user A's task
    const read = await request(app)
      .get(`/api/tasks/${task.body._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(read.status).toBe(404);

    const update = await request(app)
      .put(`/api/tasks/${task.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ completed: true });
    expect(update.status).toBe(404);

    const del = await request(app)
      .delete(`/api/tasks/${task.body._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(404);

    // User A still sees their own task
    const aList = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${aToken}`);
    expect(aList.body.length).toBe(1);
    expect(aList.body[0].title).toBe('A task');
    expect(aList.body[0].user).toBe(aUserId);
  });
});

describe('planner validation', () => {
  test('rejects missing goal', async () => {
    const res = await authed(request(app).post('/api/planner')).send({});
    expect(res.status).toBe(400);
  });

  test('creates a plan and assigns programming resources for code-related goal', async () => {
    const res = await authed(request(app).post('/api/planner')).send({
      input: 'Learn Python in 2 weeks',
      difficultyLevel: 'intermediate'
    });
    expect(res.status).toBe(201);
    expect(res.body.resources.length).toBeGreaterThan(0);
    // Should match programming bucket
    const titles = res.body.resources.map((r: any) => r.title);
    expect(titles).toContain('freeCodeCamp');
  });

  test('matches calculus to math bucket', async () => {
    const res = await authed(request(app).post('/api/planner')).send({
      input: 'Master calculus for finals',
      difficultyLevel: 'beginner'
    });
    expect(res.status).toBe(201);
    const titles = res.body.resources.map((r: any) => r.title);
    expect(titles).toContain('Khan Academy');
  });

  test('rejects bad dayIndex with 400', async () => {
    const plan = await authed(request(app).post('/api/planner')).send({
      input: 'Test plan',
      difficultyLevel: 'beginner'
    }).expect(201);

    const res = await authed(request(app).patch(`/api/planner/${plan.body._id}/progress`))
      .send({ dayIndex: 9999, completed: true });
    expect(res.status).toBe(400);

    const res2 = await authed(request(app).patch(`/api/planner/${plan.body._id}/progress`))
      .send({ dayIndex: -1, completed: true });
    expect(res2.status).toBe(400);

    const res3 = await authed(request(app).patch(`/api/planner/${plan.body._id}/progress`))
      .send({ dayIndex: 'one', completed: true });
    expect(res3.status).toBe(400);

    const res4 = await authed(request(app).patch(`/api/planner/${plan.body._id}/progress`))
      .send({ dayIndex: 0, completed: 'yes' });
    expect(res4.status).toBe(400);
  });

  test('user cannot update another user\'s plan', async () => {
    const plan = await authed(request(app).post('/api/planner')).send({
      input: 'My plan',
      difficultyLevel: 'beginner'
    }).expect(201);

    // Register a second user
    const b = await request(app).post('/api/auth/register').send({
      name: 'Bob',
      email: `b+${Date.now()}@example.com`,
      password: 'Password123!'
    }).expect(201);

    const res = await request(app)
      .patch(`/api/planner/${plan.body._id}/progress`)
      .set('Authorization', `Bearer ${b.body.token}`)
      .send({ dayIndex: 0, completed: true });
    expect(res.status).toBe(404);
  });
});

describe('streak endpoint', () => {
  test('returns 0 streak for new user', async () => {
    const res = await authed(request(app).get('/api/analytics/streak'));
    expect(res.status).toBe(200);
    expect(res.body.streak).toBe(0);
    expect(res.body.goalToday).toBeGreaterThanOrEqual(0);
  });

  test('streak is 1 after completing a task today', async () => {
    await authed(request(app).post('/api/tasks'))
      .send({ title: 'Do it', category: 'x', priority: 'medium' })
      .expect(201);
    const t = await authed(request(app).get('/api/tasks'));
    const taskId = t.body[0]._id;
    await authed(request(app).put(`/api/tasks/${taskId}`)).send({ completed: true }).expect(200);

    const res = await authed(request(app).get('/api/analytics/streak'));
    expect(res.status).toBe(200);
    expect(res.body.streak).toBeGreaterThanOrEqual(1);
  });
});
