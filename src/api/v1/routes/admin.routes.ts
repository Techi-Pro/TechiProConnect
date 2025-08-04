import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.middleware';
import { PrismaClient } from '@prisma/client';
import * as categoryController from '../controllers/category.controller';

const router = Router();
const prisma = new PrismaClient();

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
    
    // Get comprehensive dashboard statistics
    const [
      totalUsers,
      totalTechnicians,
      verifiedTechnicians,
      pendingKyc,
      totalServices,
      totalAppointments,
      recentAppointments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.technician.count(),
      prisma.technician.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.technician.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.service.count(),
      prisma.appointment.count(),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { username: true, email: true } },
          technician: { select: { username: true, email: true } }
        }
      })
    ]);

    const overview = {
      statistics: {
        users: {
          total: totalUsers,
          growth: '+12%' // You can calculate actual growth
        },
        technicians: {
          total: totalTechnicians,
          verified: verifiedTechnicians,
          pending: pendingKyc,
          verificationRate: totalTechnicians > 0 ? Math.round((verifiedTechnicians / totalTechnicians) * 100) : 0
        },
        services: {
          total: totalServices
        },
        appointments: {
          total: totalAppointments,
          recent: recentAppointments.length
        }
      },
      recentActivity: recentAppointments.map(appointment => ({
        id: appointment.id,
        type: 'appointment',
        user: appointment.client?.username,
        technician: appointment.technician?.username,
        status: appointment.status,
        createdAt: appointment.createdAt
      })),
      availableEndpoints: {
        kycStats: '/kyc-admin/kyc-statistics',
        pendingTechnicians: '/kyc-admin/technicians/pending-review',
        allUsers: '/admin/users',
        allTechnicians: '/admin/technicians',
        systemHealth: '/admin/system/health'
      },
      user: req.user
    };
    
    res.status(200).json(overview);
  } catch (error) {
    console.error('❌ Error fetching admin overview:', error);
    res.status(500).json({ message: 'Error fetching overview', error: error.message });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;
    
    console.log(`🔧 Admin: Getting all users (page ${page}, limit ${limit}, search: ${search})`);
    
    // Build where clause for search
    const whereClause = search ? {
      OR: [
        { username: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          username: true,
          email: true,
          isVerified: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              Appointment: true,
              ratings: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    res.status(200).json({
      items: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      search: search || null
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Technician management (non-KYC)
router.get('/technicians', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;
    
    console.log(`🔧 Admin: Getting all technicians (page ${page}, limit ${limit}, status: ${status}, search: ${search})`);
    
    // Build where clause
    const whereClause: any = {};
    
    if (status) {
      whereClause.verificationStatus = status;
    }
    
    if (search) {
      whereClause.OR = [
        { username: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ];
    }

    const [technicians, total] = await Promise.all([
      prisma.technician.findMany({
        where: whereClause,
        select: {
          id: true,
          username: true,
          email: true,
          verificationStatus: true,
          firebaseKycStatus: true,
          availabilityStatus: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              services: true,
              ratings: true,
              Appointment: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.technician.count({ where: whereClause })
    ]);

    res.status(200).json({
      items: technicians,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        status: status || null,
        search: search || null
      }
    });
  } catch (error) {
    console.error('❌ Error fetching technicians:', error);
    res.status(500).json({ message: 'Error fetching technicians', error: error.message });
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
    
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            technicians: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      items: categories,
      total: categories.length
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Create new category
router.post('/categories', categoryController.adminCreateCategory);

// Update category
router.put('/categories/:id', categoryController.adminUpdateCategory);

// Delete category
router.delete('/categories/:id', categoryController.adminDeleteCategory);

// Analytics and reports
router.get('/analytics/summary', async (req, res) => {
  try {
    const period = req.query.period as string || '30d';
    console.log(`🔧 Admin: Analytics summary requested for period: ${period}`);
    
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const [
      newUsers,
      newTechnicians,
      newAppointments,
      completedAppointments,
      totalRevenue,
      topCategories,
      recentActivities
    ] = await Promise.all([
      // New users in period
      prisma.user.count({
        where: { createdAt: { gte: startDate } }
      }),
      
      // New technicians in period
      prisma.technician.count({
        where: { createdAt: { gte: startDate } }
      }),
      
      // New appointments in period
      prisma.appointment.count({
        where: { createdAt: { gte: startDate } }
      }),
      
      // Completed appointments in period
      prisma.appointment.count({
        where: { 
          createdAt: { gte: startDate },
          status: 'COMPLETED'
        }
      }),
      
      // Total revenue (sum of completed payments)
      prisma.payment.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),
      
      // Top categories by technician count
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              technicians: true
            }
          }
        },
        orderBy: {
          technicians: {
            _count: 'desc'
          }
        },
        take: 5
      }),
      
      // Recent activities
      prisma.appointment.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          id: true,
          status: true,
          createdAt: true,
          client: { select: { username: true } },
          technician: { select: { username: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    const analytics = {
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      metrics: {
        newUsers,
        newTechnicians,
        newAppointments,
        completedAppointments,
        totalRevenue: totalRevenue._sum.amount || 0,
        completionRate: newAppointments > 0 ? Math.round((completedAppointments / newAppointments) * 100) : 0
      },
      topCategories: topCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        technicianCount: cat._count.technicians
      })),
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: 'appointment',
        status: activity.status,
        user: activity.client?.username,
        technician: activity.technician?.username,
        createdAt: activity.createdAt
      }))
    };

    res.status(200).json(analytics);
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// Get appointments analytics
router.get('/analytics/appointments', async (req, res) => {
  try {
    const period = req.query.period as string || '30d';
    console.log(`🔧 Admin: Appointment analytics for period: ${period}`);
    
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const [statusBreakdown, dailyAppointments] = await Promise.all([
      // Appointments by status
      prisma.appointment.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true }
      }),
      
      // Daily appointment counts (last 7 days for chart)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed
        FROM "Appointment"
        WHERE created_at >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 7
      `
    ]);

    res.status(200).json({
      period,
      statusBreakdown: statusBreakdown.map(item => ({
        status: item.status,
        count: item._count.id
      })),
      dailyTrend: dailyAppointments
    });
  } catch (error) {
    console.error('❌ Error fetching appointment analytics:', error);
    res.status(500).json({ message: 'Error fetching appointment analytics', error: error.message });
  }
});

// System settings and configuration
router.get('/settings', async (req, res) => {
  try {
    console.log('🔧 Admin: Fetching system settings');
    
    // In a real implementation, these might come from a settings table
    // For now, return mock settings structure
    const settings = {
      general: {
        siteName: 'TechiProConnect',
        maintenanceMode: false,
        registrationEnabled: true,
        emailVerificationRequired: true
      },
      payment: {
        stripeEnabled: true,
        commissionRate: 10, // percentage
        minimumWithdrawal: 50
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true
      },
      kyc: {
        firebaseKycEnabled: true,
        autoApprovalEnabled: false,
        documentTypesRequired: ['ID_CARD', 'WORK_PERMIT']
      }
    };

    res.status(200).json(settings);
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    console.log('🔧 Admin: Updating system settings');
    const updatedSettings = req.body;
    
    // In a real implementation, you would validate and save to a settings table
    // For now, just return the updated settings
    console.log('Settings update requested:', updatedSettings);
    
    res.status(200).json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
});

// General admin routes can be added here
// All KYC-related functionality is now in technician-kyc.routes.ts

export default router;
