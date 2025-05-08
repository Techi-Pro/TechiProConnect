import { body } from 'express-validator';

export const createCategoryValidator = [
  body('name').exists().withMessage('Name is required').isString().notEmpty().trim().escape(),
]; 