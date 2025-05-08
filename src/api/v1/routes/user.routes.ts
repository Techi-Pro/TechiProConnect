import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { createUserValidator, updateUserValidator } from '../validators/user.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.post('/', createUserValidator, handleValidationErrors, userController.createUser);
router.post('/login', userController.loginUser); // Add login route
router.get('/verify-email', userController.verifyEmail); // Add verify-email route
router.get('/:id', requireRole('USER', 'ADMIN'), userController.getUser);
router.put('/:id', requireRole('USER', 'ADMIN'), updateUserValidator, handleValidationErrors, userController.updateUser);

export default router;