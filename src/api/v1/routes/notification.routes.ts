import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// Register device token (USER or TECHNICIAN)
router.post('/register', requireRole('USER', 'TECHNICIAN'), notificationController.registerDeviceToken);
// Send push notification (ADMIN only for now)
router.post('/send', requireRole('ADMIN'), notificationController.sendPushNotification);

export default router; 