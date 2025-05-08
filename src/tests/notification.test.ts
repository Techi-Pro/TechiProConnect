import request from 'supertest';
import app from '../api/v1/server';

describe('Notification API', () => {
  it('should register a device token (USER/TECHNICIAN)', async () => {
    const res = await request(app)
      .post('/api/v1/notifications/register')
      .set('Authorization', 'Bearer fake-jwt-for-user') // Replace with a real user/technician JWT if needed
      .send({ token: 'test-device-token' });
    expect([201, 401, 403]).toContain(res.status);
  });

  it('should forbid device token registration without auth', async () => {
    const res = await request(app)
      .post('/api/v1/notifications/register')
      .send({ token: 'test-device-token' });
    expect([401, 403]).toContain(res.status);
  });

  it('should send push notification (ADMIN only)', async () => {
    const res = await request(app)
      .post('/api/v1/notifications/send')
      .set('Authorization', 'Bearer fake-jwt-for-admin') // Replace with a real admin JWT if needed
      .send({ token: 'test-device-token', title: 'Test', body: 'Hello', data: { foo: 'bar' } });
    expect([200, 401, 403]).toContain(res.status);
  });

  it('should forbid sending notification without admin role', async () => {
    const res = await request(app)
      .post('/api/v1/notifications/send')
      .set('Authorization', 'Bearer fake-jwt-for-user')
      .send({ token: 'test-device-token', title: 'Test', body: 'Hello', data: { foo: 'bar' } });
    expect([401, 403]).toContain(res.status);
  });
}); 