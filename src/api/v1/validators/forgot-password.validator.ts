import { body } from 'express-validator';

export const forgotPasswordValidator = [
  body('email').exists().withMessage('Email is required').isEmail().withMessage('Valid email is required').trim().normalizeEmail(),
];

export const resetPasswordValidator = [
  body('newPassword').exists().withMessage('New password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').trim(),
]; 