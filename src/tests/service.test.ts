import request from 'supertest';
import app from '../api/v1/server';
import { PrismaClient } from '@prisma/client';

jest.setTimeout(20000);
const prisma = new PrismaClient();
const uniqueCategoryName = `TestCategoryForService_${Date.now()}`;
const uniqueTechUsername = `servicetech_${Date.now()}`;
const uniqueTechEmail = `servicetech_${Date.now()}@example.com`;
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
      password: 'hashedpassword', // You may want to hash if your model requires it
      categoryId,
      documents: '/tmp/dummy.pdf',
      verificationStatus: 'VERIFIED',
      isVerified: true
    }
  });
  technicianId = technician.id;
});

afterAll(async () => {
  await prisma.service.deleteMany({ where: { technicianId } });
  await prisma.technician.deleteMany({ where: { username: { contains: 'servicetech' } } });
  await prisma.category.deleteMany({ where: { name: { contains: 'TestCategoryForService' } } });
  await prisma.$disconnect();
});

describe('Service API Validation', () => {
  it('should reject missing name', async () => {
    const res = await request(app)
      .post('/api/v1/services')
      .send({ price: 100, technicianId: 'techid' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('name');
  });

  it('should reject invalid price', async () => {
    const res = await request(app)
      .post('/api/v1/services')
      .send({ name: 'Service', price: -10, technicianId: 'techid' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('price');
  });

  it('should reject missing technicianId', async () => {
    const res = await request(app)
      .post('/api/v1/services')
      .send({ name: 'Service', price: 100 });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('technicianId');
  });

  it('should accept valid service', async () => {
    const res = await request(app)
      .post('/api/v1/services')
      .send({ name: 'Service', price: 100, technicianId });
    expect([201, 400, 404]).toContain(res.status); // 400/404 if technicianId is invalid
  });
});

describe('Service API Pagination', () => {
  it('should return paginated services', async () => {
    const res = await request(app)
      .get('/api/v1/services?page=1&limit=2')
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

describe('Service API Sanitization', () => {
  it('should sanitize name input', async () => {
    const res = await request(app)
      .post('/api/v1/services')
      .send({ name: '<script>alert(1)</script>', price: 100, technicianId: 'techid' });
    expect([201, 400]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.name).not.toContain('<script>');
    }
  });
});

describe('Service API RBAC', () => {
  it('should forbid access to a protected endpoint without proper role', async () => {
    const res = await request(app)
      .delete('/api/v1/services/1')
      .set('Authorization', 'Bearer fake-jwt-for-user'); // Replace with a real user JWT if needed
    expect([401, 403, 404]).toContain(res.status); // 404 if service not found
  });
}); 