import { body } from 'express-validator';

export const upsertLocationValidator = [
  body('latitude').exists().withMessage('Latitude is required').isFloat().withMessage('Latitude must be a number'),
  body('longitude').exists().withMessage('Longitude is required').isFloat().withMessage('Longitude must be a number'),
  body('address').exists().withMessage('Address is required').isString().notEmpty().trim().escape(),
]; 