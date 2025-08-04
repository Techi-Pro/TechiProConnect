import { Router } from 'express';
import * as ratingController from '../controllers/rating.controller';
import { createRatingValidator } from '../validators/rating.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', protect, authorize('USER'), createRatingValidator, handleValidationErrors, ratingController.createRating);
router.get('/technician/:technicianId', ratingController.getRatingsByTechnician);

export default router; 