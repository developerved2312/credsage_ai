import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { updateProfileSchema } from './user.validation';

const router = Router();
const userController = new UserController();

/**
 * User Routes
 * Auth routes (/register, /login, /logout) are handled by Better Auth at /api/auth/*
 */

// Protected routes - Require authentication
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), userController.updateProfile);
router.delete('/account', authenticate, userController.deleteAccount);
router.get('/stats', authenticate, userController.getStats);
router.get('/session', authenticate, userController.getSession);

export default router;
