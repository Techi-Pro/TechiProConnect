import { body } from 'express-validator';

export const makePaymentValidator = [
  body('appointmentId').exists().withMessage('AppointmentId is required').isString().notEmpty().trim().escape(),
  body('amount').exists().withMessage('Amount is required').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('phoneNumber').exists().withMessage('PhoneNumber is required').isString().notEmpty().trim().escape(),
]; 