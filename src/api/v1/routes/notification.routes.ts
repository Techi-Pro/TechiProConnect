import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Register device token (USER or TECHNICIAN)
router.post('/register', protect, authorize('USER', 'TECHNICIAN'), notificationController.registerDeviceToken);
// Send push notification (ADMIN only for now)
router.post('/send', protect, authorize('ADMIN'), notificationController.sendPushNotification);

export default router; 