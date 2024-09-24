import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

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

export default router;
