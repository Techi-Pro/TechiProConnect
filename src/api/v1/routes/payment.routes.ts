import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { makePaymentValidator } from '../validators/payment.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', protect, authorize('USER', 'TECHNICIAN'), makePaymentValidator, handleValidationErrors, paymentController.makePayment);
router.post('/callback', paymentController.handlePaymentCallback);

// Simulate Daraja payment (USER or TECHNICIAN)
router.post('/daraja', protect, authorize('USER', 'TECHNICIAN'), paymentController.simulateDarajaPayment);

export default router; 