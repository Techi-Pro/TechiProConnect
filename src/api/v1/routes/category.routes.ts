import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { createCategoryValidator } from '../validators/category.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', categoryController.getCategories);
router.post('/', protect, authorize('ADMIN'), createCategoryValidator, handleValidationErrors, categoryController.createCategory);

export default router; 