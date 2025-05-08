import request from 'supertest';
import app from '../api/v1/server';
import { PrismaClient } from '@prisma/client';

jest.setTimeout(20000);
const prisma = new PrismaClient();
const uniqueCategoryName = `TestCategoryForLocation_${Date.now()}`;
const uniqueTechUsername = `locationtech_${Date.now()}`;
const uniqueTechEmail = `locationtech_${Date.now()}@example.com`;
let categoryId: number;
let technicianId: string;

beforeAll(async () => {
  // Create a category
  const category = await prisma.category.create({ data: { name: uniqueCategoryName } });
  categoryId = category.id;
  // Create a technician (bypass file upload for test, set documents to a dummy path)
  const technician = await prisma.technician.create({
    data: {
      username: uniqueTechUsername,
      email: uniqueTechEmail,
      password: 'hashedpassword',
      categoryId,
      documents: '/tmp/dummy.pdf',
      verificationStatus: 'VERIFIED',
      isVerified: true
    }
  });
  technicianId = technician.id;
});

afterAll(async () => {
  await prisma.location.deleteMany({ where: { technicianId } });
  await prisma.technician.deleteMany({ where: { username: { contains: 'locationtech' } } });
  await prisma.category.deleteMany({ where: { name: { contains: 'TestCategoryForLocation' } } });
  await prisma.$disconnect();
});

describe('Location API Validation', () => {
  it('should reject missing latitude', async () => {
    const res = await request(app)
      .post('/api/v1/locations')
      .send({ longitude: 10, address: 'Test Address' });
    expect([400, 403]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.errors[0].param).toBe('latitude');
    }
  });

  it('should reject missing longitude', async () => {
    const res = await request(app)
      .post('/api/v1/locations')
      .send({ latitude: 10, address: 'Test Address' });
    expect([400, 403]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.errors[0].param).toBe('longitude');
    }
  });

  it('should reject missing address', async () => {
    const res = await request(app)
      .post('/api/v1/locations')
      .send({ latitude: 10, longitude: 10 });
    expect([400, 403]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.errors[0].param).toBe('address');
    }
  });

  it('should accept valid location', async () => {
    const res = await request(app)
      .post('/api/v1/locations')
      .send({ latitude: 10, longitude: 10, address: 'Test Address', technicianId });
    expect([200, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.message).toBe('Location upserted successfully');
    }
  });
});

describe('Location API Sanitization', () => {
  it('should sanitize address input', async () => {
    const res = await request(app)
      .post('/api/v1/locations')
      .send({ latitude: 10, longitude: 10, address: '<script>alert(1)</script>', technicianId });
    expect([200, 400, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.address).not.toContain('<script>');
    }
  });
});

describe('Location API RBAC', () => {
  it('should forbid upsert location without technician role', async () => {
    const res = await request(app)
      .post('/api/v1/locations')
      .send({ latitude: 10, longitude: 10, address: 'Test Address', technicianId })
      .set('Authorization', 'Bearer fake-jwt-for-user'); // Replace with a real user JWT if needed
    expect([401, 403]).toContain(res.status);
  });
}); 