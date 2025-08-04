import { Router } from 'express';
import * as locationController from '../controllers/location.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { upsertLocationValidator } from '../validators/location.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';

const router = Router();

// Only technicians can upsert their own location
router.post('/', protect, authorize('TECHNICIAN'), upsertLocationValidator, handleValidationErrors, locationController.upsertLocation);
// Add more location-related routes as needed

export default router; 