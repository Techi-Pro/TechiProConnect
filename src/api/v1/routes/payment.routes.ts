import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { makePaymentValidator } from '../validators/payment.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
// import payment validators and auth middleware as needed

const router = Router();

router.post('/', makePaymentValidator, handleValidationErrors, paymentController.makePayment);
router.post('/callback', paymentController.handlePaymentCallback);

// Simulate Daraja payment (USER or TECHNICIAN)
router.post('/daraja', requireRole('USER', 'TECHNICIAN') as any, paymentController.simulateDarajaPayment);

export default router; 