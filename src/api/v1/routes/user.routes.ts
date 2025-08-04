import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { createUserValidator, updateUserValidator } from '../validators/user.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', createUserValidator, handleValidationErrors, userController.createUser);
router.get('/:id', protect, authorize('USER', 'ADMIN'), userController.getUser);
router.put('/:id', protect, authorize('USER', 'ADMIN'), updateUserValidator, handleValidationErrors, userController.updateUser);
router.delete('/:id', protect, authorize('ADMIN'), userController.deleteUser);

export default router;