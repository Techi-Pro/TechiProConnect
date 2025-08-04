import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Get chat history for an appointment (USER or TECHNICIAN)
router.get('/appointment/:appointmentId', protect, authorize('USER', 'TECHNICIAN'), messageController.getMessagesByAppointment);

export default router; 