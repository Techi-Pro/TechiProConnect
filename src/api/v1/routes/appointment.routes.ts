import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller';
import { createAppointmentValidator, updateAppointmentValidator } from '../validators/appointment.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Create an appointment
router.post('/', protect, authorize('USER', 'ADMIN'), createAppointmentValidator, handleValidationErrors, appointmentController.createAppointment);

// Get appointments for a client
router.get('/client/:clientId', protect, authorize('USER', 'ADMIN'), appointmentController.getAppointmentsByClient);

// Get appointments for a technician
router.get('/technician/:technicianId', protect, authorize('TECHNICIAN', 'ADMIN'), appointmentController.getAppointmentsByTechnician);

// Update an appointment (e.g., reschedule or change status)
router.put('/:id', protect, authorize('USER', 'TECHNICIAN', 'ADMIN'), updateAppointmentValidator, handleValidationErrors, appointmentController.updateAppointment);

// Cancel an appointment
router.delete('/:id', appointmentController.deleteAppointment);

export default router;
