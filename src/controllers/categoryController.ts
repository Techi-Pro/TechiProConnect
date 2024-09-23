import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
};

export const createCategory = async (req, res) => {
    const { name } = req.body;

    try {
        // Check if the category name already exists
        const existingCategory = await prisma.category.findUnique({
            where: { name },
        });

        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        // Validate if the name is provided
        if (!name || name.trim() === "") {
            return res.status(400).json({ message: 'Category name is required' });
        }

        // Create a new category
        const category = await prisma.category.create({
            data: { name },
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Error creating category' });
    }
};
