import { Router } from 'express';
import * as technicianKycController from '../controllers/technician-kyc.controller';
import { protect, authorize } from '../middlewares/auth.middleware'; // Import both

const router = Router();

// Admin routes for KYC management
router.get(
  '/admin/technicians/pending-review',
  protect,
  authorize('ADMIN'), //  Use this instead of requireRole
  technicianKycController.getTechniciansForAdminReview
);

router.post(
  '/admin/technicians/:technicianId/final-verification',
  protect,
  authorize('ADMIN'), // Use this instead of requireRole
  technicianKycController.adminFinalVerification
);

router.get(
  '/admin/kyc-statistics',
  protect,
  authorize('ADMIN'), //  Use this instead of requireRole
  technicianKycController.getKycStatistics
);

export default router;