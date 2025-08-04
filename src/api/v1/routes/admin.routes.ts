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

// Comprehensive admin dashboard endpoints
router.get('/overview', async (req, res) => {
  try {
    console.log('🔧 Admin overview requested');
    
    // You can implement actual statistics here or redirect to KYC
    res.status(200).json({
      message: 'Admin overview - use specific endpoints',
      availableEndpoints: {
        kycStats: '/kyc-admin/kyc-statistics',
        pendingTechnicians: '/kyc-admin/technicians/pending-review',
        allUsers: '/admin/users',
        allTechnicians: '/admin/technicians',
        systemHealth: '/admin/system/health'
      },
      user: req.user
    });
  } catch (error) {
    console.error('❌ Error fetching admin overview:', error);
    res.status(500).json({ message: 'Error fetching overview' });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    console.log(`🔧 Admin: Getting all users (page ${page}, limit ${limit})`);
    
    // Add your user fetching logic here
    res.status(200).json({
      message: 'Users endpoint - implement user fetching logic',
      pagination: { page, limit },
      note: 'This endpoint needs implementation with actual user service'
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Technician management (non-KYC)
router.get('/technicians', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    
    console.log(`🔧 Admin: Getting all technicians (page ${page}, limit ${limit}, status: ${status})`);
    
    // Add your technician fetching logic here
    res.status(200).json({
      message: 'Technicians endpoint - implement technician fetching logic',
      filters: { status },
      pagination: { page, limit },
      note: 'This endpoint needs implementation with actual technician service'
    });
  } catch (error) {
    console.error('❌ Error fetching technicians:', error);
    res.status(500).json({ message: 'Error fetching technicians' });
  }
});

// System health and monitoring
router.get('/system/health', async (req, res) => {
  try {
    console.log('🔧 Admin: System health check requested');
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.status(200).json(healthData);
  } catch (error) {
    console.error('❌ Error checking system health:', error);
    res.status(500).json({ message: 'Error checking system health' });
  }
});

// Service categories management
router.get('/categories', async (req, res) => {
  try {
    console.log('🔧 Admin: Getting service categories');
    
    res.status(200).json({
      message: 'Service categories endpoint',
      note: 'Implement category fetching logic or redirect to /categories endpoint'
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Analytics and reports
router.get('/analytics/summary', async (req, res) => {
  try {
    const period = req.query.period as string || '30d';
    console.log(`🔧 Admin: Analytics summary requested for period: ${period}`);
    
    res.status(200).json({
      message: 'Analytics summary endpoint',
      period,
      note: 'Implement analytics logic with actual data'
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

// General admin routes can be added here
// All KYC-related functionality is now in technician-kyc.routes.ts

export default router;
