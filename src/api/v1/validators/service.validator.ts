import { body } from 'express-validator';

export const createServiceValidator = [
  body('name').exists().withMessage('Name is required').isString().notEmpty().trim().escape(),
  body('price').exists().withMessage('Price is required').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('technicianId').exists().withMessage('TechnicianId is required').isString().notEmpty().trim().escape(),
];

export const updateServiceValidator = [
  body('name').optional().isString().trim().escape(),
  body('price').optional().isFloat({ gt: 0 }),
  body('technicianId').optional().isString().trim().escape(),
]; 