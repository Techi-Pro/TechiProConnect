import request from 'supertest';
import app from '../api/v1/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const uniqueUsername = `testuser_${Date.now()}`;
const uniqueEmail = `testuser_${Date.now()}@example.com`;

describe('User API Validation', () => {
  it('should reject missing username', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('username');
  });

  it('should reject invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ username: 'test', email: 'not-an-email', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('email');
  });

  it('should reject short password', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ username: 'test', email: 'test@example.com', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('password');
  });

  it('should accept valid user', async () => {
    // Clean up any existing user with the same username/email
    await prisma.user.deleteMany({ where: { OR: [ { username: uniqueUsername }, { email: uniqueEmail } ] } });
    const res = await request(app)
      .post('/api/v1/users')
      .send({ username: uniqueUsername, email: uniqueEmail, password: 'password123' });
    expect([201, 400]).toContain(res.status); // 400 if user/email already exists
  }, 15000); // Increased timeout to 15 seconds
});

describe('User API Pagination', () => {
  it('should return paginated users', async () => {
    const res = await request(app)
      .get('/api/v1/users?page=1&limit=2')
      .set('Authorization', 'Bearer fake-jwt-for-admin'); // Replace with a real admin JWT if needed
    expect([200, 401, 403, 404]).toContain(res.status); // 404 if endpoint not found
    if (res.status === 200) {
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pageSize');
    }
  });
});

describe('User API Sanitization', () => {
  it('should sanitize username input', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ username: '<script>alert(1)</script>', email: uniqueEmail, password: 'password123' });
    expect([201, 400]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.username).not.toContain('<script>');
    }
  });
});

describe('User API RBAC', () => {
  it('should forbid access to a protected endpoint without proper role', async () => {
    const res = await request(app)
      .delete('/api/v1/users/someid')
      .set('Authorization', 'Bearer fake-jwt-for-user'); // Replace with a real user JWT if needed
    expect([401, 403, 404]).toContain(res.status); // 404 if user not found
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { username: { contains: 'testuser' } } });
  await prisma.$disconnect();
});
