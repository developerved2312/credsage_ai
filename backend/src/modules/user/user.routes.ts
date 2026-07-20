import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from './user.validation';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);

// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), userController.updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), userController.changePassword);
router.delete('/account', authenticate, userController.deleteAccount);
router.get('/stats', authenticate, userController.getStats);

export default router;
