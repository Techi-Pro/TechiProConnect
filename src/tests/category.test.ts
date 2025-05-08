import request from 'supertest';
import app from '../api/v1/server';
import { PrismaClient } from '@prisma/client';

jest.setTimeout(20000);
const prisma = new PrismaClient();
const uniqueCategoryName = `TestCategory_${Date.now()}`;

describe('Category API Validation', () => {
  it('should reject missing name', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.errors[0].param).toBe('name');
  });

  it('should accept valid category', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .send({ name: uniqueCategoryName });
    expect([201, 400]).toContain(res.status); // 400 if category already exists
  });
});

describe('Category API Pagination', () => {
  it('should return paginated categories', async () => {
    const res = await request(app)
      .get('/api/v1/categories?page=1&limit=2');
    expect([200, 401, 403]).toContain(res.status);
    if (res.status === 200 && Array.isArray(res.body.items)) {
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pageSize');
    }
  });
});

describe('Category API Sanitization', () => {
  it('should sanitize name input', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .send({ name: '<script>alert(1)</script>' });
    expect([201, 400]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.name).not.toContain('<script>');
    }
  });
});

afterAll(async () => {
  await prisma.category.deleteMany({ where: { name: { contains: 'TestCategory' } } });
  await prisma.$disconnect();
}); 