import { Request, Response } from 'express';
import { UserService } from './user.service';
import { ResponseUtil } from '../../utils/response';
import { asyncHandler } from '../../middleware/error.middleware';
import { Logger } from '../../utils/logger';

const logger = new Logger('UserController');
const userService = new UserService();

export class UserController {
  register = asyncHandler(async (req: Request, res: Response) => {
    logger.info('Register endpoint called');
    
    const result = await userService.register(req.body);
    
    return ResponseUtil.created(res, result, 'User registered successfully');
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    logger.info('Login endpoint called');
    
    const result = await userService.login(req.body);
    
    return ResponseUtil.success(res, result, 'Login successful');
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    logger.info(`Get profile endpoint called for user: ${userId}`);
    
    const profile = await userService.getProfile(userId);
    
    return ResponseUtil.success(res, profile, 'Profile fetched successfully');
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    logger.info(`Update profile endpoint called for user: ${userId}`);
    
    const profile = await userService.updateProfile(userId, req.body);
    
    return ResponseUtil.success(res, profile, 'Profile updated successfully');
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    logger.info(`Change password endpoint called for user: ${userId}`);
    
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(userId, currentPassword, newPassword);
    
    return ResponseUtil.success(res, result, 'Password changed successfully');
  });

  deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    logger.info(`Delete account endpoint called for user: ${userId}`);
    
    const result = await userService.deleteAccount(userId);
    
    return ResponseUtil.success(res, result, 'Account deleted successfully');
  });

  getStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    logger.info(`Get stats endpoint called for user: ${userId}`);
    
    const stats = await userService.getUserStats(userId);
    
    return ResponseUtil.success(res, stats, 'User stats fetched successfully');
  });
}
