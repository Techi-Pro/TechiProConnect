import { PrismaClient, VerificationStatus, FirebaseKycStatus } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

/**
 * Handle Firebase KYC result submission from mobile app
 * This endpoint receives the Firebase KYC verification results
 */
export const submitFirebaseKyc = async (req: Request, res: Response) => {
  const { technicianId } = req.params;
  const { 
    firebaseKycStatus, 
    firebaseKycData, 
    documentUrls,
    confidenceScore 
  } = req.body;

  try {
    console.log(`🔧 KYC Controller: Processing Firebase KYC for technician ${technicianId}`);
    console.log('🔧 User making request:', req.user);
    
    const technician = await prisma.technician.findUnique({
      where: { id: technicianId }
    });

    if (!technician) {
      console.log(`❌ Technician ${technicianId} not found`);
      res.status(404).json({ message: 'Technician not found' });
      return;
    }

    // Determine next step based on Firebase result
    let nextVerificationStatus: VerificationStatus = VerificationStatus.PENDING;
    let requiresAdminReview = true;

    // If Firebase confidence is very high, could auto-approve
    if (firebaseKycStatus === FirebaseKycStatus.FIREBASE_VERIFIED && confidenceScore > 0.95) {
      nextVerificationStatus = VerificationStatus.VERIFIED;
      requiresAdminReview = false;
      console.log(`✅ Auto-approving technician ${technicianId} due to high confidence score: ${confidenceScore}`);
    } else if (firebaseKycStatus === FirebaseKycStatus.FIREBASE_REJECTED) {
      nextVerificationStatus = VerificationStatus.REJECTED;
      requiresAdminReview = false;
      console.log(`❌ Auto-rejecting technician ${technicianId} due to Firebase rejection`);
    }

    // Update technician with Firebase KYC results
    const updatedTechnician = await prisma.technician.update({
      where: { id: technicianId },
      data: {
        firebaseKycStatus,
        firebaseKycData: {
          ...firebaseKycData,
          documentUrls,
          confidenceScore,
          processedAt: new Date(),
          requiresAdminReview
        },
        verificationStatus: nextVerificationStatus,
        updatedAt: new Date()
      }
    });

    // If requires admin review, notify admin dashboard
    if (requiresAdminReview) {
      await notifyAdminForReview(technicianId, firebaseKycData);
    }

    console.log(`✅ Firebase KYC processed for technician ${technicianId}, requires admin review: ${requiresAdminReview}`);

    res.status(200).json({ 
      message: 'Firebase KYC results processed successfully',
      technician: updatedTechnician,
      requiresAdminReview
    });

  } catch (error) {
    console.error('❌ Error processing Firebase KYC:', error);
    res.status(500).json({ 
      message: 'Error processing Firebase KYC results', 
      error: error.message 
    });
  }
};

/**
 * Get technicians pending admin review after Firebase KYC
 */
export const getTechniciansForAdminReview = async (req: Request, res: Response) => {
  try {
    console.log('🔧 KYC Controller: Getting technicians for admin review');
    console.log('🔧 User making request:', req.user);
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [technicians, total] = await Promise.all([
      prisma.technician.findMany({
        where: {
          firebaseKycStatus: {
            in: [FirebaseKycStatus.FIREBASE_VERIFIED, FirebaseKycStatus.FIREBASE_REJECTED]
          },
          verificationStatus: VerificationStatus.PENDING
        },
        select: {
          id: true,
          username: true,
          email: true,
          firebaseKycStatus: true,
          firebaseKycData: true,
          verificationStatus: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.technician.count({
        where: {
          firebaseKycStatus: {
            in: [FirebaseKycStatus.FIREBASE_VERIFIED, FirebaseKycStatus.FIREBASE_REJECTED]
          },
          verificationStatus: VerificationStatus.PENDING
        }
      })
    ]);

    console.log(`🔧 Found ${technicians.length} technicians for admin review (total: ${total})`);

    res.status(200).json({ 
      items: technicians, 
      total, 
      page, 
      pageSize: limit 
    });

  } catch (error) {
    console.error('❌ Error fetching technicians for admin review:', error);
    res.status(500).json({ 
      message: 'Error fetching technicians for admin review', 
      error: error.message 
    });
  }
};

/**
 * Admin final verification after Firebase KYC
 */
export const adminFinalVerification = async (req: Request, res: Response) => {
  try {
    const { technicianId } = req.params;
    const { decision, adminNotes } = req.body; // decision: 'approve' | 'reject'
    
    console.log(`🔧 KYC Controller: Admin final verification for technician ${technicianId}, decision: ${decision}`);
    console.log('🔧 User making request:', req.user);

    const technician = await prisma.technician.findUnique({
      where: { id: technicianId }
    });

    if (!technician) {
      console.log(`❌ Technician ${technicianId} not found for admin verification`);
      res.status(404).json({ message: 'Technician not found' });
      return;
    }

    const verificationStatus = decision === 'approve' 
      ? VerificationStatus.VERIFIED 
      : VerificationStatus.REJECTED;

    const updatedTechnician = await prisma.technician.update({
      where: { id: technicianId },
      data: {
        verificationStatus,
        adminNotes,
        updatedAt: new Date()
      }
    });

    // Send notification to technician about final decision
    await notifyTechnicianOfDecision(updatedTechnician, decision, adminNotes);

    console.log(`✅ Technician ${technicianId} ${decision}d by admin successfully`);

    res.status(200).json({ 
      message: `Technician ${decision}d successfully`,
      technician: updatedTechnician
    });

  } catch (error) {
    console.error('❌ Error in admin final verification:', error);
    res.status(500).json({ 
      message: 'Error processing admin verification', 
      error: error.message 
    });
  }
};

/**
 * Get Firebase KYC statistics for admin dashboard
 */
export const getKycStatistics = async (req: Request, res: Response) => {
  console.log('🎯 getKycStatistics - Controller reached!');
  console.log('🎯 getKycStatistics - Request user:', req.user);
  console.log('🎯 getKycStatistics - Headers auth:', req.headers.authorization);
  console.log('🎯 getKycStatistics - Request method:', req.method);
  console.log('🎯 getKycStatistics - Request path:', req.path);
  console.log('🎯 getKycStatistics - Request originalUrl:', req.originalUrl);
  
  try {
    console.log('🔍 getKycStatistics - Starting database query...');
    
    const stats = await prisma.technician.groupBy({
      by: ['firebaseKycStatus', 'verificationStatus'],
      _count: {
        id: true
      }
    });

    console.log('✅ getKycStatistics - Database query successful:', stats);

    const formattedStats = {
      pending: 0,
      firebaseVerified: 0,
      firebaseRejected: 0,
      adminApproved: 0,
      adminRejected: 0,
      awaitingAdminReview: 0
    };

    stats.forEach(stat => {
      if (stat.firebaseKycStatus === FirebaseKycStatus.PENDING) {
        formattedStats.pending += stat._count.id;
      } else if (stat.firebaseKycStatus === FirebaseKycStatus.FIREBASE_VERIFIED) {
        if (stat.verificationStatus === VerificationStatus.VERIFIED) {
          formattedStats.adminApproved += stat._count.id;
        } else {
          formattedStats.awaitingAdminReview += stat._count.id;
        }
        formattedStats.firebaseVerified += stat._count.id;
      } else if (stat.firebaseKycStatus === FirebaseKycStatus.FIREBASE_REJECTED) {
        formattedStats.firebaseRejected += stat._count.id;
      }
    });

    console.log('✅ getKycStatistics - Formatted stats:', formattedStats);
    console.log('✅ getKycStatistics - Sending response...');

    res.status(200).json(formattedStats);

  } catch (error) {
    console.error('❌ getKycStatistics - Error occurred:', error);
    console.error('❌ getKycStatistics - Error message:', error.message);
    console.error('❌ getKycStatistics - Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Error fetching KYC statistics', 
      error: error.message 
    });
  }
};

/**
 * Get KYC status for a technician
 */
export const getKycStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(`🔧 KYC Controller: Getting KYC status for technician ${id}`);

    const technician = await prisma.technician.findUnique({
      where: { id },
      select: {
        id: true,
        firebaseKycStatus: true,
        verificationStatus: true,
        firebaseKycData: true,
        confidenceScore: true,
        adminNotes: true,
        kycProcessedAt: true,
        adminReviewedAt: true
      }
    });

    if (!technician) {
      res.status(404).json({ message: 'Technician not found' });
      return;
    }

    res.status(200).json({
      message: 'KYC status retrieved successfully',
      kycStatus: technician
    });

  } catch (error) {
    console.error('❌ Error getting KYC status:', error);
    res.status(500).json({
      message: 'Error getting KYC status',
      error: error.message
    });
  }
};

// Helper functions
async function notifyAdminForReview(technicianId, kycData) {
  // Implement admin notification logic
  // Could be email, push notification, or dashboard alert
  console.log(`📧 Admin review required for technician: ${technicianId}`);
}

async function notifyTechnicianOfDecision(technician, decision, notes) {
  // Implement technician notification logic
  // Email or push notification about final verification decision
  console.log(`📧 Technician ${technician.id} has been ${decision}d`);
  if (notes) {
    console.log(`📝 Admin notes: ${notes}`);
  }
}
