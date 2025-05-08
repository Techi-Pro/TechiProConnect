import { body } from 'express-validator';

export const createUserValidator = [
  body('username').exists().withMessage('Username is required').isString().notEmpty(),
  body('email').exists().withMessage('Email is required').isEmail().withMessage('Valid email is required'),
  body('password').exists().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const updateUserValidator = [
  body('username').optional().isString(),
  body('email').optional().isEmail(),
  body('password').optional().isLength({ min: 6 }),
]; 