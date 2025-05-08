import { Router } from 'express';
import * as locationController from '../controllers/location.controller';
import { requireRole } from '../middlewares/rbac.middleware';
import { upsertLocationValidator } from '../validators/location.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';
// import location validators and auth middleware as needed

const router = Router();

// Only technicians can upsert their own location
router.post('/', requireRole('TECHNICIAN') as any, upsertLocationValidator, handleValidationErrors, locationController.upsertLocation);
// Add more location-related routes as needed

export default router; 