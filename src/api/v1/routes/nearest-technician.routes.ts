import { Router } from 'express';
import { nearestTechnicianHandler } from '../controllers/nearest-technician.controller';
// import validators and auth middleware as needed

const router = Router();

router.post('/technicians/nearest', nearestTechnicianHandler);

export default router; 