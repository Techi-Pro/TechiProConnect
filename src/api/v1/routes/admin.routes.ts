import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Debug middleware to log all admin route access
router.use((req, res, next) => {
  console.log(`🔧 ADMIN ROUTE ACCESS: ${req.method} ${req.originalUrl}`);
  console.log(`🔧 User:`, req.user);
  console.log(`🔧 Headers:`, req.headers.authorization);
  next();
});

// All admin routes require authentication and ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

// Admin endpoints for Firebase KYC dashboard
router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('🔧 Admin dashboard stats requested - redirecting to KYC stats');
    
    // Redirect to Firebase KYC statistics
    res.status(200).json({
      message: 'Use Firebase KYC statistics endpoint',
      redirectTo: '/kyc-admin/kyc-statistics',
      timestamp: new Date().toISOString(),
      user: req.user
    });
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

// General admin routes can be added here
// All KYC-related functionality is now in technician-kyc.routes.ts

export default router;
