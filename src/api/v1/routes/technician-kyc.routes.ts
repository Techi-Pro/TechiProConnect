import { Router } from 'express';
import * as technicianKycController from '../controllers/technician-kyc.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Add comprehensive logging
console.log('📋 Setting up KYC routes...');
console.log('🔍 Middleware imports:', { protect: !!protect, authorize: !!authorize });
console.log('🔍 Controller imports:', { getKycStatistics: !!technicianKycController.getKycStatistics });

// Test middleware logging for KYC admin routes
router.use('/kyc-admin/*', (req, res, next) => {
  console.log('🔍 KYC Admin route middleware hit:', req.method, req.originalUrl);
  console.log('🔍 Authorization header:', req.headers.authorization);
  next();
});

// Changed from /admin/* to /kyc-admin/* to avoid conflicts
router.get(
  '/kyc-admin/technicians/pending-review',
  (req, res, next) => {
    console.log('🔍 Route: /kyc-admin/technicians/pending-review - middleware 1');
    next();
  },
  protect,
  (req, res, next) => {
    console.log('🔍 Route: /kyc-admin/technicians/pending-review - after protect');
    next();
  },
  authorize('ADMIN'),
  (req, res, next) => {
    console.log('🔍 Route: /kyc-admin/technicians/pending-review - after authorize');
    next();
  },
  technicianKycController.getTechniciansForAdminReview
);

router.post(
  '/kyc-admin/technicians/:technicianId/final-verification',
  (req, res, next) => {
    console.log('🔍 Route: /kyc-admin/technicians/:technicianId/final-verification - middleware 1');
    next();
  },
  protect,
  authorize('ADMIN'),
  technicianKycController.adminFinalVerification
);

router.get(
  '/kyc-admin/kyc-statistics',
  (req, res, next) => {
    console.log('🔍 Route: /kyc-admin/kyc-statistics - middleware 1');
    console.log('🔍 Request details:', {
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl,
      headers: req.headers.authorization
    });
    next();
  },
  protect,
  (req, res, next) => {
    console.log('🔍 Route: /kyc-admin/kyc-statistics - after protect');
    next();
  },
  authorize('ADMIN'),
  (req, res, next) => {
    console.log('🔍 Route: /kyc-admin/kyc-statistics - after authorize');
    next();
  },
  technicianKycController.getKycStatistics
);

// Regular technician KYC routes (non-admin)
router.post('/technicians/:technicianId/firebase-kyc', protect, technicianKycController.submitFirebaseKyc);
router.get('/technicians/:id/kyc-status', protect, technicianKycController.getKycStatus);

console.log('✅ KYC routes setup complete');

export default router;
