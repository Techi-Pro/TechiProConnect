import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller';
import { createAppointmentValidator, updateAppointmentValidator } from '../validators/appointment.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';

const router = Router();

// Create an appointment
router.post('/', createAppointmentValidator, handleValidationErrors, appointmentController.createAppointment);

// Get appointments for a client
router.get('/client/:clientId', appointmentController.getAppointmentsByClient);

// Get appointments for a technician
router.get('/technician/:technicianId', appointmentController.getAppointmentsByTechnician);

// Update an appointment (e.g., reschedule or change status)
router.put('/:id', updateAppointmentValidator, handleValidationErrors, appointmentController.updateAppointment);

// Cancel an appointment
router.delete('/:id', appointmentController.deleteAppointment);

export default router;
