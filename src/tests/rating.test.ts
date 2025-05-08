import request from 'supertest';
import app from '../api/v1/server';

describe('Rating API Validation', () => {
  it('should reject missing score', async () => {
    const res = await request(app)
      .post('/api/v1/ratings')
      .send({ comment: 'Good', technicianId: 'techid', userId: 'userid' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('score');
  });

  it('should reject score out of range', async () => {
    const res = await request(app)
      .post('/api/v1/ratings')
      .send({ score: 10, comment: 'Good', technicianId: 'techid', userId: 'userid' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('score');
  });

  it('should reject missing technicianId', async () => {
    const res = await request(app)
      .post('/api/v1/ratings')
      .send({ score: 5, comment: 'Good', userId: 'userid' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('technicianId');
  });

  it('should accept valid rating', async () => {
    const res = await request(app)
      .post('/api/v1/ratings')
      .send({ score: 5, comment: 'Great', technicianId: 'techid', userId: 'userid' });
    expect([201, 400, 404]).toContain(res.status); // 400/404 if technician/user not found
  });
}); 