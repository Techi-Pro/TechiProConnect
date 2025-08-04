import * as categoryService from '../services/category.service';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCategories = async (req, res) => {
    try {
        const categories = await categoryService.getCategories();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCategory = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Admin-specific category management functions
export const adminCreateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    console.log(`🔧 Admin: Creating new category: ${name}`);
    
    const category = await prisma.category.create({
      data: { name },
      select: {
        id: true,
        name: true
      }
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error: any) {
    console.error('❌ Error creating category:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ message: 'Category name already exists' });
    } else {
      res.status(500).json({ message: 'Error creating category', error: error.message });
    }
  }
};

export const adminUpdateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    console.log(`🔧 Admin: Updating category ${id} to: ${name}`);
    
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name },
      select: {
        id: true,
        name: true
      }
    });

    res.status(200).json({
      message: 'Category updated successfully',
      category
    });
  } catch (error: any) {
    console.error('❌ Error updating category:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Category not found' });
    } else if (error.code === 'P2002') {
      res.status(409).json({ message: 'Category name already exists' });
    } else {
      res.status(500).json({ message: 'Error updating category', error: error.message });
    }
  }
};

export const adminDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔧 Admin: Deleting category ${id}`);
    
    // Check if category has technicians
    const categoryWithCount = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      select: {
        _count: {
          select: {
            technicians: true
          }
        }
      }
    });

    if (!categoryWithCount) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (categoryWithCount._count.technicians > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with associated technicians',
        counts: categoryWithCount._count
      });
    }
    
    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      message: 'Category deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ Error deleting category:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Category not found' });
    } else {
      res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
  }
};
