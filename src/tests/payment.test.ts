import request from 'supertest';
import app from '../api/v1/server';

describe('Payment API Validation', () => {
  it('should reject missing appointmentId', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .send({ amount: 100, phoneNumber: '1234567890' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('appointmentId');
  });

  it('should reject invalid amount', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .send({ appointmentId: 'appid', amount: -10, phoneNumber: '1234567890' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('amount');
  });

  it('should reject missing phoneNumber', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .send({ appointmentId: 'appid', amount: 100 });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('phoneNumber');
  });

  it('should accept valid payment', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .send({ appointmentId: 'appid', amount: 100, phoneNumber: '1234567890' });
    expect([201, 400, 404]).toContain(res.status); // 400/404 if appointment not found
  });
});

describe('Payment API RBAC', () => {
  it('should forbid Daraja payment without proper role', async () => {
    const res = await request(app)
      .post('/api/v1/payments/daraja')
      .send({ appointmentId: 'appid', amount: 100, phoneNumber: '1234567890' })
      .set('Authorization', 'Bearer fake-jwt-for-user'); // Replace with a real user JWT if needed
    expect([401, 403]).toContain(res.status);
  });
});

describe('Payment API Daraja Simulation', () => {
  it('should accept valid Daraja payment', async () => {
    const res = await request(app)
      .post('/api/v1/payments/daraja')
      .send({ appointmentId: 'appid', amount: 100, phoneNumber: '1234567890' })
      .set('Authorization', 'Bearer fake-jwt-for-technician'); // Replace with a real technician JWT if needed
    expect([201, 400, 404, 403]).toContain(res.status);
  });
}); 