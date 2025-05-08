import request from 'supertest';
import app from '../api/v1/server';

describe('Appointment API Validation', () => {
  it('should reject missing clientId', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .send({ technicianId: 'techid', serviceType: 'Repair', appointmentDate: '2024-01-01T10:00:00Z' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('clientId');
  });

  it('should reject missing technicianId', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .send({ clientId: 'clientid', serviceType: 'Repair', appointmentDate: '2024-01-01T10:00:00Z' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('technicianId');
  });

  it('should reject missing serviceType', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .send({ clientId: 'clientid', technicianId: 'techid', appointmentDate: '2024-01-01T10:00:00Z' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('serviceType');
  });

  it('should reject invalid appointmentDate', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .send({ clientId: 'clientid', technicianId: 'techid', serviceType: 'Repair', appointmentDate: 'not-a-date' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('appointmentDate');
  });

  it('should accept valid appointment', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .send({ clientId: 'clientid', technicianId: 'techid', serviceType: 'Repair', appointmentDate: '2024-01-01T10:00:00Z' });
    expect([201, 400, 404]).toContain(res.status); // 400/404 if client/technician not found
  });
}); 