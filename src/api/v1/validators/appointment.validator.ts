import { body } from 'express-validator';

export const createAppointmentValidator = [
  body('clientId').exists().withMessage('ClientId is required').isString().notEmpty().trim().escape(),
  body('technicianId').exists().withMessage('TechnicianId is required').isString().notEmpty().trim().escape(),
  body('serviceType').exists().withMessage('ServiceType is required').isString().notEmpty().trim().escape(),
  body('appointmentDate').exists().withMessage('AppointmentDate is required').isISO8601().withMessage('AppointmentDate must be a valid date'),
];

export const updateAppointmentValidator = [
  body('serviceType').optional().isString().trim().escape(),
  body('appointmentDate').optional().isISO8601(),
  body('status').optional().isString().trim().escape(),
]; 