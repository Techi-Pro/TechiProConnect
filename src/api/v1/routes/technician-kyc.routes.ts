import { Router } from 'express';
import * as technicianKycController from '../controllers/technician-kyc.controller';
import { requireRole } from '../middlewares/rbac.middleware';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Firebase KYC submission from mobile app
router.post(
  '/technicians/:technicianId/firebase-kyc',
  protect,
  requireRole('TECHNICIAN') as any,
  technicianKycController.submitFirebaseKyc
);

// Admin routes for KYC management
router.get(
  '/admin/technicians/pending-review',
  protect,
  requireRole('ADMIN') as any,
  technicianKycController.getTechniciansForAdminReview
);

router.post(
  '/admin/technicians/:technicianId/final-verification',
  protect,
  requireRole('ADMIN') as any,
  technicianKycController.adminFinalVerification
);

router.get(
  '/admin/kyc-statistics',
  protect,
  requireRole('ADMIN') as any,
  technicianKycController.getKycStatistics
);

export default router;
