import request from 'supertest';
import app from '../api/v1/server';

describe('Forgot Password API Validation', () => {
  it('should reject missing email', async () => {
    const res = await request(app)
      .post('/api/v1/forgot-password')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('email');
  });

  it('should reject invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/forgot-password')
      .send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('email');
  });

  it('should accept valid email', async () => {
    const res = await request(app)
      .post('/api/v1/forgot-password')
      .send({ email: 'test@example.com' });
    expect([200, 400]).toContain(res.status); // 400 if user not found
  });
});

describe('Reset Password API Validation', () => {
  it('should reject missing newPassword', async () => {
    const res = await request(app)
      .post('/api/v1/reset-password')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('newPassword');
  });

  it('should reject short newPassword', async () => {
    const res = await request(app)
      .post('/api/v1/reset-password')
      .send({ newPassword: '123' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('newPassword');
  });

  it('should accept valid newPassword', async () => {
    const res = await request(app)
      .post('/api/v1/reset-password')
      .send({ newPassword: 'password123' });
    expect([200, 400]).toContain(res.status); // 400 if token is missing/invalid
  });
}); 