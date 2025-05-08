import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCategories = async () => {
    return prisma.category.findMany();
};

export const createCategory = async ({ name }) => {
    if (!name || name.trim() === "") throw new Error('Category name is required');
    const existingCategory = await prisma.category.findUnique({ where: { name } });
    if (existingCategory) throw new Error('Category already exists');
    return prisma.category.create({ data: { name } });
}; 