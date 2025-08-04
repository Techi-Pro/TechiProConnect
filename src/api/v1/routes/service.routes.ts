import { Router } from 'express';
import * as serviceController from '../controllers/service.controller';
import { createServiceValidator, updateServiceValidator } from '../validators/service.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getService);
router.post('/', protect, authorize('TECHNICIAN', 'ADMIN'), createServiceValidator, handleValidationErrors, serviceController.createService);
router.put('/:id', protect, authorize('TECHNICIAN', 'ADMIN'), updateServiceValidator, handleValidationErrors, serviceController.updateService);
router.delete('/:id', protect, authorize('ADMIN'), serviceController.deleteService);

export default router; 