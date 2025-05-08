import { Router } from 'express';
import * as serviceController from '../controllers/service.controller';
import { createServiceValidator, updateServiceValidator } from '../validators/service.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';
// import service validators and auth middleware as needed

const router = Router();

router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getService);
router.post('/', createServiceValidator, handleValidationErrors, serviceController.createService);
router.put('/:id', updateServiceValidator, handleValidationErrors, serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

export default router; 