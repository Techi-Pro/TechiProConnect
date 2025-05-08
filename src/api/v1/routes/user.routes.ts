import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { createUserValidator, updateUserValidator } from '../validators/user.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
// import user validators and auth middleware as needed

const router = Router();

router.post('/', createUserValidator, handleValidationErrors, userController.createUser);
router.get('/:id', requireRole('USER', 'ADMIN') as any, userController.getUser);
router.put('/:id', requireRole('USER', 'ADMIN') as any, updateUserValidator, handleValidationErrors, userController.updateUser);
// Example: Only users can create service requests
// router.post('/service-request', requireRole('USER'), userController.createServiceRequest);
// Example: Only admins can delete users
// router.delete('/:id', requireRole('ADMIN'), userController.deleteUser);

export default router; 