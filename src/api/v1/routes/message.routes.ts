import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// Get chat history for an appointment (USER or TECHNICIAN)
router.get('/appointment/:appointmentId', requireRole('USER', 'TECHNICIAN') as any, messageController.getMessagesByAppointment);

export default router; 