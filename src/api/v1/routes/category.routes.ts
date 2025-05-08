import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { createCategoryValidator } from '../validators/category.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';
// import category validators and auth middleware as needed

const router = Router();

router.get('/', categoryController.getCategories);
router.post('/', createCategoryValidator, handleValidationErrors, categoryController.createCategory);

export default router; 