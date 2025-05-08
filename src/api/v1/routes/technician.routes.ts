import { Router } from 'express';
import * as technicianController from '../controllers/technician.controller';
import { createTechnicianValidator, updateTechnicianValidator } from '../validators/technician.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
// import technician validators and auth middleware as needed

const router = Router();

router.get('/', technicianController.getTechnicians);
router.get('/:id', technicianController.getTechnician);
router.post('/', createTechnicianValidator, handleValidationErrors, technicianController.createTechnician);
router.put('/:id', updateTechnicianValidator, handleValidationErrors, technicianController.updateTechnician);
router.delete('/:id', technicianController.deleteTechnician);
router.get('/verify-email', technicianController.verifyTechnicianEmail);
router.post('/login', technicianController.loginTechnician);

// Example: Only technicians can update their own location
// router.put('/:id/location', requireRole('TECHNICIAN'), technicianController.updateLocation);
// Example: Only admins can verify technicians
// router.patch('/:id/verify', requireRole('ADMIN'), technicianController.verifyTechnician);

// Public route to find nearby technicians
router.get('/nearby', technicianController.getNearbyTechnicians);

export default router; 