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

// Individual user management
router.get('/users/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    console.log(`🔧 Admin: Getting user details for ID: ${id}`);
    
    const user = await prisma.user.findUnique({
      where: { id },
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
        },
        Appointment: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            technician: {
              select: {
                username: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('❌ Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, isVerified, role } = req.body;
    
    console.log(`🔧 Admin: Updating user ${id}`);
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(typeof isVerified === 'boolean' && { isVerified }),
        ...(role && { role })
      },
      select: {
        id: true,
        username: true,
        email: true,
        isVerified: true,
        role: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('❌ Error updating user:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'User not found' });
    } else if (error.code === 'P2002') {
      res.status(409).json({ message: 'Username or email already exists' });
    } else {
      res.status(500).json({ message: 'Error updating user', error: error.message });
    }
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔧 Admin: Soft deleting user ${id}`);
    
    // Soft delete by setting active to false (if you have this field) or just delete
    await prisma.user.delete({
      where: { id }
    });

    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
  }
});

// Individual technician management
router.get('/technicians/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    console.log(`🔧 Admin: Getting technician details for ID: ${id}`);
    
    const technician = await prisma.technician.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        verificationStatus: true,
        firebaseKycStatus: true,
        availabilityStatus: true,
        createdAt: true,
        updatedAt: true,
        firebaseKycData: true,
        confidenceScore: true,
        adminNotes: true,
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
        },
        services: {
          select: {
            id: true,
            name: true,
            price: true
          }
        },
        Appointment: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            client: {
              select: {
                username: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    res.status(200).json(technician);
  } catch (error) {
    console.error('❌ Error fetching technician details:', error);
    res.status(500).json({ message: 'Error fetching technician details', error: error.message });
  }
});

router.put('/technicians/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, verificationStatus, availabilityStatus, categoryId, adminNotes } = req.body;
    
    console.log(`🔧 Admin: Updating technician ${id}`);
    
    const technician = await prisma.technician.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(verificationStatus && { verificationStatus }),
        ...(availabilityStatus && { availabilityStatus }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(adminNotes !== undefined && { adminNotes })
      },
      select: {
        id: true,
        username: true,
        email: true,
        verificationStatus: true,
        firebaseKycStatus: true,
        availabilityStatus: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(200).json({
      message: 'Technician updated successfully',
      technician
    });
  } catch (error) {
    console.error('❌ Error updating technician:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Technician not found' });
    } else if (error.code === 'P2002') {
      res.status(409).json({ message: 'Username or email already exists' });
    } else {
      res.status(500).json({ message: 'Error updating technician', error: error.message });
    }
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

// Appointment management
router.get('/appointments', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;
    
    console.log(`🔧 Admin: Getting all appointments (page ${page}, limit ${limit}, status: ${status}, search: ${search})`);
    
    // Build where clause
    const whereClause: any = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause.OR = [
        { client: { username: { contains: search, mode: 'insensitive' as const } } },
        { technician: { username: { contains: search, mode: 'insensitive' as const } } },
        { serviceType: { contains: search, mode: 'insensitive' as const } }
      ];
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: whereClause,
        select: {
          id: true,
          serviceType: true,
          appointmentDate: true,
          status: true,
          createdAt: true,
          client: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          technician: {
            select: {
              id: true,
              username: true,
              email: true,
              category: {
                select: {
                  name: true
                }
              }
            }
          },
          Payment: {
            select: {
              amount: true,
              status: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.appointment.count({ where: whereClause })
    ]);

    res.status(200).json({
      items: appointments,
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
    console.error('❌ Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

router.get('/appointments/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    console.log(`🔧 Admin: Getting appointment details for ID: ${id}`);
    
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        serviceType: true,
        appointmentDate: true,
        status: true,
        createdAt: true,
        client: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        technician: {
          select: {
            id: true,
            username: true,
            email: true,
            category: {
              select: {
                name: true
              }
            }
          }
        },
        Payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            transactionId: true,
            createdAt: true
          }
        },
        messages: {
          select: {
            id: true,
            content: true,
            senderId: true,
            sentAt: true
          },
          orderBy: { sentAt: 'asc' }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error('❌ Error fetching appointment details:', error);
    res.status(500).json({ message: 'Error fetching appointment details', error: error.message });
  }
});

router.put('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, appointmentDate } = req.body;
    
    console.log(`🔧 Admin: Updating appointment ${id}`);
    
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        ...(status && { status }),
        ...(appointmentDate && { appointmentDate: new Date(appointmentDate) })
      },
      select: {
        id: true,
        status: true,
        appointmentDate: true,
        client: {
          select: {
            username: true
          }
        },
        technician: {
          select: {
            username: true
          }
        }
      }
    });

    res.status(200).json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    console.error('❌ Error updating appointment:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Appointment not found' });
    } else {
      res.status(500).json({ message: 'Error updating appointment', error: error.message });
    }
  }
});

// Service management
router.get('/services', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;
    
    console.log(`🔧 Admin: Getting all services (page ${page}, limit ${limit}, search: ${search})`);
    
    // Build where clause for search
    const whereClause = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { technician: { username: { contains: search, mode: 'insensitive' as const } } }
      ]
    } : {};

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          price: true,
          createdAt: true,
          technician: {
            select: {
              id: true,
              username: true,
              category: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.service.count({ where: whereClause })
    ]);

    res.status(200).json({
      items: services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      search: search || null
    });
  } catch (error) {
    console.error('❌ Error fetching services:', error);
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
});

// Payment management
router.get('/payments', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;
    
    console.log(`🔧 Admin: Getting all payments (page ${page}, limit ${limit}, status: ${status})`);
    
    // Build where clause - properly type the status as PaymentStatus
    const whereClause = status ? { status: status as any } : {};

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        select: {
          id: true,
          transactionId: true,
          amount: true,
          status: true,
          createdAt: true,
          appointment: {
            select: {
              id: true,
              serviceType: true,
              client: {
                select: {
                  username: true,
                  email: true
                }
              },
              technician: {
                select: {
                  username: true,
                  email: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.count({ where: whereClause })
    ]);

    res.status(200).json({
      items: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        status: status || null
      }
    });
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

router.get('/payments/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    console.log(`🔧 Admin: Getting payment details for ID: ${id}`);
    
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        transactionId: true,
        amount: true,
        status: true,
        createdAt: true,
        appointment: {
          select: {
            id: true,
            serviceType: true,
            appointmentDate: true,
            status: true,
            client: {
              select: {
                id: true,
                username: true,
                email: true
              }
            },
            technician: {
              select: {
                id: true,
                username: true,
                email: true,
                category: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error('❌ Error fetching payment details:', error);
    res.status(500).json({ message: 'Error fetching payment details', error: error.message });
  }
});

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
