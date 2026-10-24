import request from 'supertest';
import app from '../src/app.js';
import { initDb, query } from '../src/db.js';

describe('TaskBoard API Endpoints & Business Logic Tests', () => {
  let userAToken;
  let userBToken;
  let userAId;
  let userBId;
  let userATaskId;

  const userAEmail = `alice_${Date.now()}@example.com`;
  const userBEmail = `bob_${Date.now()}@example.com`;

  beforeAll(async () => {
    await initDb();
    // Clean test users except demo user
    await query("DELETE FROM users WHERE email != 'demo@taskboard.com'");
  });

  describe('1. Health Check', () => {
    it('GET /api/health should return 200 with "OK"', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.text).toBe('OK');
    });
  });

  describe('2. Authentication & Validation', () => {
    it('POST /api/auth/signup should reject passwords less than 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Short Pass User',
          email: 'short@example.com',
          password: '123'
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('at least 8 characters');
    });

    it('POST /api/auth/signup should reject missing names', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: '',
          email: 'noname@example.com',
          password: 'password123'
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Name is required');
    });

    it('POST /api/auth/signup should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Alice Tester',
          email: userAEmail,
          password: 'Password123!'
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe(userAEmail);
      userAToken = res.body.token;
      userAId = res.body.user.id;
    });

    it('POST /api/auth/signup should prevent duplicate registrations', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Alice Dup',
          email: userAEmail,
          password: 'Password123!'
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('already exists');
    });

    it('POST /api/auth/login should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: userAEmail,
          password: 'WrongPassword'
        });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password');
    });

    it('POST /api/auth/login should succeed with seeded demo credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'demo@taskboard.com',
          password: 'Demo@123'
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.name).toBe('Priya');
    });
  });

  describe('3. Task Management & User Isolation', () => {
    beforeAll(async () => {
      // Register User B for isolation testing
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Bob Tester',
          email: userBEmail,
          password: 'Password123!'
        });
      userBToken = res.body.token;
      userBId = res.body.user.id;
    });

    it('GET /api/tasks without token should return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(401);
    });

    it('POST /api/tasks should reject empty title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: '   ',
          priority: 'High'
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title is required');
    });

    it('POST /api/tasks should create a task with default priority Medium', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Complete 3D UI Implementation',
          description: 'Use Three.js canvas and framer-motion cards'
        });
      expect(res.status).toBe(201);
      expect(res.body.task.title).toBe('Complete 3D UI Implementation');
      expect(res.body.task.priority).toBe('Medium');
      expect(res.body.task.completed).toBe(false);
      userATaskId = res.body.task.id;
    });

    it('User B cannot see User A tasks (User Isolation test)', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userBToken}`);
      expect(res.status).toBe(200);
      expect(res.body.tasks).toHaveLength(0);
      expect(res.body.counts.total).toBe(0);
    });

    it('User B cannot edit User A task', async () => {
      const res = await request(app)
        .put(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          title: 'Hacked Title'
        });
      expect(res.status).toBe(404);
    });

    it('User B cannot delete User A task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`);
      expect(res.status).toBe(404);
    });

    it('User A can update task to completed (strike-through)', async () => {
      const res = await request(app)
        .put(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          completed: true
        });
      expect(res.status).toBe(200);
      expect(res.body.task.completed).toBe(true);

      // Verify counts update
      const listRes = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(listRes.body.counts.completed).toBe(1);
      expect(listRes.body.counts.pending).toBe(0);
    });

    it('User A can filter tasks by status=completed', async () => {
      const res = await request(app)
        .get('/api/tasks?status=completed')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.status).toBe(200);
      expect(res.body.tasks).toHaveLength(1);
    });

    it('User A can create and update a task with custom category', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Design high-contrast accessibility tokens',
          category: 'Design',
          priority: 'High'
        });
      expect(createRes.status).toBe(201);
      expect(createRes.body.task.category).toBe('Design');

      const updateRes = await request(app)
        .put(`/api/tasks/${createRes.body.task.id}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          category: 'Development'
        });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.task.category).toBe('Development');

      // Clean up
      await request(app)
        .delete(`/api/tasks/${createRes.body.task.id}`)
        .set('Authorization', `Bearer ${userAToken}`);
    });

    it('User A can delete their task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify task is gone
      const listRes = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(listRes.body.tasks).toHaveLength(0);
      expect(listRes.body.counts.total).toBe(0);
    });
  });

  describe('4. Pomodoro Focus Sessions & Persistence', () => {
    it('POST /api/focus/sessions requires authentication', async () => {
      const res = await request(app)
        .post('/api/focus/sessions')
        .send({ durationMinutes: 25 });
      expect(res.status).toBe(401);
    });

    it('POST /api/focus/sessions records a completed session', async () => {
      const res = await request(app)
        .post('/api/focus/sessions')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          durationMinutes: 25,
          mode: 'focus'
        });
      expect(res.status).toBe(201);
      expect(res.body.session).toHaveProperty('id');
      expect(res.body.session.duration_minutes).toBe(25);
    });

    it('GET /api/focus/stats calculates aggregate focus metrics', async () => {
      const res = await request(app)
        .get('/api/focus/stats')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.status).toBe(200);
      expect(res.body.totalSessions).toBeGreaterThanOrEqual(1);
      expect(res.body.totalMinutes).toBeGreaterThanOrEqual(25);
      expect(Array.isArray(res.body.dailyBreakdown)).toBe(true);
      expect(res.body.dailyBreakdown).toHaveLength(7);
    });
  });
});

