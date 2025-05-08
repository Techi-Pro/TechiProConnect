import { validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const mapped = errors.array().map(e => ({ ...e, param: (e as any).path || (e as any).param }));
    console.log('Validation errors:', mapped);
    return res.status(400).json({ errors: mapped });
  }
  next();
}; 