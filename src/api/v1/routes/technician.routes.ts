import { Router } from 'express';
import * as technicianController from '../controllers/technician.controller';
import { createTechnicianValidator, updateTechnicianValidator } from '../validators/technician.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', technicianController.getTechnicians);
router.get('/:id', technicianController.getTechnician);
router.post('/', createTechnicianValidator, handleValidationErrors, technicianController.createTechnician);
router.put('/:id', protect, authorize('TECHNICIAN', 'ADMIN'), updateTechnicianValidator, handleValidationErrors, technicianController.updateTechnician);
router.delete('/:id', protect, authorize('ADMIN'), technicianController.deleteTechnician);
router.get('/verify-email', technicianController.verifyTechnicianEmail);
router.post('/login', technicianController.loginTechnician);

// Example: Only technicians can update their own location
// router.put('/:id/location', protect, authorize('TECHNICIAN'), technicianController.updateLocation);
// Example: Only admins can verify technicians
// router.patch('/:id/verify', requireRole('ADMIN'), technicianController.verifyTechnician);

// Public route to find nearby technicians
router.get('/nearby', technicianController.getNearbyTechnicians);

export default router; 