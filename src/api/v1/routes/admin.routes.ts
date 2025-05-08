import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import * as adminController from '../controllers/admin.controller';
import { handleValidationErrors } from '../middlewares/validation.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();
const prisma = new PrismaClient();

// All admin routes require ADMIN role
router.use(requireRole('ADMIN') as any);

// Admin route to get all technicians with pending documents
router.get('/admin/technicians/pending', async (req, res) => {
  try {
    const pendingTechnicians = await prisma.technician.findMany({
      where: { verificationStatus: 'PENDING' },
      select: {
        id: true,
        username: true,
        documents: true,
        verificationStatus: true,
      },
    });
    
    res.status(200).json(pendingTechnicians);
  } catch (error) {
    console.error('Error fetching pending technicians:', error);
    res.status(500).json({ message: 'Error fetching pending technicians' });
  }
});

// Admin route to approve a technician's document
router.post('/admin/technicians/:id/approve', async (req, res) => {
  const { id } = req.params;

  try {
    const technician = await prisma.technician.update({
      where: { id },
      data: { verificationStatus: 'VERIFIED' },
    });

    res.status(200).json({ message: 'Technician document approved', technician });
  } catch (error) {
    console.error('Error approving document:', error);
    res.status(500).json({ message: 'Error approving document' });
  }
});

// Admin route to reject a technician's document
router.post('/admin/technicians/:id/reject', async (req, res) => {
  const { id } = req.params;

  try {
    const technician = await prisma.technician.update({
      where: { id },
      data: { verificationStatus: 'REJECTED' },
    });

    res.status(200).json({ message: 'Technician document rejected', technician });
  } catch (error) {
    console.error('Error rejecting document:', error);
    res.status(500).json({ message: 'Error rejecting document' });
  }
});

router.get('/technicians/pending', adminController.getPendingTechnicians);
router.post('/technicians/:id/approve', adminController.approveTechnician);
router.post('/technicians/:id/reject', adminController.rejectTechnician);

export default router;
