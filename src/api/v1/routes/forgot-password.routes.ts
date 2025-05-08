import { Router } from 'express';
import * as forgotPasswordController from '../controllers/forgot-password.controller';
import { forgotPasswordValidator, resetPasswordValidator } from '../validators/forgot-password.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';

const router = Router();

router.post('/forgot-password', forgotPasswordValidator, handleValidationErrors, forgotPasswordController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, handleValidationErrors, forgotPasswordController.resetPassword);

export default router; 