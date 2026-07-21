import { Request, Response } from 'express';
import { UserService } from './user.service';
import { ResponseUtil } from '../../utils/response';
import { asyncHandler } from '../../middleware/error.middleware';
import { Logger } from '../../utils/logger';

const logger = new Logger('UserController');
const userService = new UserService();

/**
 * User Controller - HTTP request handlers
 * Delegates business logic to UserService
 */
export class UserController {
  /**
   * Get authenticated user's profile
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info(`Get profile endpoint called for user: ${userId}`);
    
    const profile = await userService.getProfile(userId);
    
    return ResponseUtil.success(res, profile, 'Profile fetched successfully');
  });

  /**
   * Update authenticated user's profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info(`Update profile endpoint called for user: ${userId}`);
    
    const profile = await userService.updateProfile(userId, req.body);
    
    return ResponseUtil.success(res, profile, 'Profile updated successfully');
  });

  /**
   * Delete authenticated user's account
   */
  deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info(`Delete account endpoint called for user: ${userId}`);
    
    const result = await userService.deleteAccount(userId);
    
    return ResponseUtil.success(res, result, 'Account deleted successfully');
  });

  /**
   * Get authenticated user's statistics
   */
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info(`Get stats endpoint called for user: ${userId}`);
    
    const stats = await userService.getUserStats(userId);
    
    return ResponseUtil.success(res, stats, 'User stats fetched successfully');
  });

  /**
   * Get current session information
   */
  getSession = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info(`Get session endpoint called for user: ${userId}`);
    
    return ResponseUtil.success(res, {
      user: req.user,
      session: req.session,
    }, 'Session information retrieved');
  });
}
