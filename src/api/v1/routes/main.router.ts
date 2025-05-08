import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import userRoutes from './user.routes';
import technicianRoutes from './technician.routes';
import serviceRoutes from './service.routes';
import categoryRoutes from './category.routes';
import ratingRoutes from './rating.routes';
import locationRoutes from './location.routes';
import paymentRoutes from './payment.routes';
import appointmentRoutes from './appointment.routes';
import adminRoutes from './admin.routes';
import nearestTechnicianRoutes from './nearest-technician.routes';
import messageRoutes from './message.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// Public routes
router.get('/verify-email', userController.verifyEmail); // Handle /api/v1/verify-email

// Sub-routers
router.use('/users', userRoutes);
router.use('/technicians', technicianRoutes);
router.use('/services', serviceRoutes);
router.use('/categories', categoryRoutes);
router.use('/ratings', ratingRoutes);
router.use('/locations', locationRoutes);
router.use('/payments', paymentRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/admin', adminRoutes);
router.use('/nearest-technicians', nearestTechnicianRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);

export default router;