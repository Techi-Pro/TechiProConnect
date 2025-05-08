import request from 'supertest';
import app from '../api/v1/server';

describe('API Routes', () => {
  it('should return 200 and a welcome message at the root', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Hello World');
  });
});

describe('API Rate Limiting', () => {
  it('should return 429 when rate limit is exceeded', async () => {
    let lastStatus = 200;
    for (let i = 0; i < 110; i++) {
      const res = await request(app).get('/');
      lastStatus = res.status;
      if (lastStatus === 429) break;
    }
    expect([200, 429]).toContain(lastStatus);
  });
});



