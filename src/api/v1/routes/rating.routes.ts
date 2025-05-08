import { Router } from 'express';
import * as ratingController from '../controllers/rating.controller';
import { createRatingValidator } from '../validators/rating.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';
// import rating validators and auth middleware as needed

const router = Router();

router.post('/', createRatingValidator, handleValidationErrors, ratingController.createRating);
router.get('/technician/:technicianId', ratingController.getRatingsByTechnician);

export default router; 