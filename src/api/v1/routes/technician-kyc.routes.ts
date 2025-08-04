import { Router } from 'express';
import * as technicianKycController from '../controllers/technician-kyc.controller';
import { protect, authorize } from '../middlewares/auth.middleware'; // Import both

const router = Router();

// Add logging to verify route registration
console.log('📋 Registering KYC admin routes...');

// Admin routes for KYC management
router.get(
  '/admin/technicians/pending-review',
  (req, res, next) => {
    console.log('🔍 Route hit: /admin/technicians/pending-review');
    console.log('🔍 Method:', req.method);
    console.log('🔍 Headers:', req.headers.authorization);
    next();
  },
  protect,
  authorize('ADMIN'),
  technicianKycController.getTechniciansForAdminReview
);

router.post(
  '/admin/technicians/:technicianId/final-verification',
  (req, res, next) => {
    console.log('🔍 Route hit: /admin/technicians/:technicianId/final-verification');
    console.log('🔍 Method:', req.method);
    console.log('🔍 Headers:', req.headers.authorization);
    next();
  },
  protect,
  authorize('ADMIN'),
  technicianKycController.adminFinalVerification
);

router.get(
  '/admin/kyc-statistics',
  (req, res, next) => {
    console.log('🔍 Route hit: /admin/kyc-statistics');
    console.log('🔍 Method:', req.method);
    console.log('🔍 Headers:', req.headers.authorization);
    console.log('🔍 Full URL:', req.originalUrl);
    console.log('🔍 Query params:', req.query);
    next();
  },
  protect,
  authorize('ADMIN'),
  technicianKycController.getKycStatistics
);

console.log('✅ KYC admin routes registered successfully');

export default router;