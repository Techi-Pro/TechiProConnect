import { body } from 'express-validator';

export const createRatingValidator = [
  body('score').exists().withMessage('Score is required').isInt({ min: 1, max: 5 }).withMessage('Score must be between 1 and 5'),
  body('comment').optional().isString().trim().escape(),
  body('technicianId').exists().withMessage('TechnicianId is required').isString().notEmpty().trim().escape(),
  body('userId').exists().withMessage('UserId is required').isString().notEmpty().trim().escape(),
]; 