import { Router } from 'express';
import { nearestTechnicianHandler } from '../controllers/nearest-technician.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/technicians/nearest', protect, authorize('USER', 'ADMIN'), nearestTechnicianHandler);

export default router; 