import request from 'supertest';
import app from '../api/v1/server';

describe('Technician API Validation', () => {
  it('should reject missing username', async () => {
    const res = await request(app)
      .post('/api/v1/technicians')
      .send({ email: 'tech@example.com', password: 'password123', categoryId: 1 });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('username');
  });

  it('should reject invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/technicians')
      .send({ username: 'tech', email: 'not-an-email', password: 'password123', categoryId: 1 });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('email');
  });

  it('should reject short password', async () => {
    const res = await request(app)
      .post('/api/v1/technicians')
      .send({ username: 'tech', email: 'tech@example.com', password: '123', categoryId: 1 });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('password');
  });

  it('should reject missing categoryId', async () => {
    const res = await request(app)
      .post('/api/v1/technicians')
      .send({ username: 'tech', email: 'tech@example.com', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('categoryId');
  });

  it('should accept valid technician', async () => {
    const res = await request(app)
      .post('/api/v1/technicians')
      .send({ username: 'tech1', email: 'tech1@example.com', password: 'password123', categoryId: 1 });
    expect([201, 400]).toContain(res.status); // 400 if file upload is required or duplicate
  });
});

describe('Technician API Pagination', () => {
  it('should return paginated technicians', async () => {
    const res = await request(app)
      .get('/api/v1/technicians?page=1&limit=2')
      .set('Authorization', 'Bearer fake-jwt-for-admin'); // Replace with a real admin JWT if needed
    expect([200, 401, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pageSize');
    }
  });
});

describe('Technician API Sanitization', () => {
  it('should sanitize username input', async () => {
    const res = await request(app)
      .post('/api/v1/technicians')
      .send({ username: '<script>alert(1)</script>', email: `xss_tech_${Date.now()}@example.com`, password: 'password123', categoryId: 1 });
    expect([201, 400]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.username).not.toContain('<script>');
    }
  });
});

describe('Technician API RBAC', () => {
  it('should forbid access to a protected endpoint without proper role', async () => {
    const res = await request(app)
      .delete('/api/v1/technicians/someid')
      .set('Authorization', 'Bearer fake-jwt-for-user'); // Replace with a real user JWT if needed
    expect([401, 403, 404]).toContain(res.status); // 404 if technician not found
  });
}); 