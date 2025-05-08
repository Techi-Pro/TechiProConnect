import { body } from 'express-validator';

export const createTechnicianValidator = [
  body('username').exists().withMessage('Username is required').isString().notEmpty().trim().escape(),
  body('email').exists().withMessage('Email is required').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').exists().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').trim(),
  body('categoryId').exists().withMessage('CategoryId is required').isInt().withMessage('CategoryId must be an integer'),
];

export const updateTechnicianValidator = [
  body('username').optional().isString().trim().escape(),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 6 }).trim(),
  body('categoryId').optional().isInt(),
]; 