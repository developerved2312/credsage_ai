import { Request, Response } from 'express';
import { CreditService } from './credit.service';
import { ResponseUtil } from '../../utils/response';
import { asyncHandler } from '../../middleware/error.middleware';
import { Logger } from '../../utils/logger';

const logger = new Logger('CreditController');
const creditService = new CreditService();

export class CreditController {
  calculateScore = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    logger.info(`Calculate credit score endpoint called for user: ${userId}`);

    const creditScore = await creditService.calculateCreditScore(userId, req.body);

    return ResponseUtil.created(res, creditScore, 'Credit score calculated successfully');
  });

  getHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { limit, offset } = req.query as { limit?: number; offset?: number };
    
    logger.info(`Get credit history endpoint called for user: ${userId}`);

    const history = await creditService.getCreditHistory(
      userId,
      limit ? Number(limit) : 10,
      offset ? Number(offset) : 0
    );

    return ResponseUtil.success(res, history, 'Credit history fetched successfully');
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    logger.info(`Get credit score by ID endpoint called: ${id}`);

    const creditScore = await creditService.getCreditScoreById(userId, id);

    return ResponseUtil.success(res, creditScore, 'Credit score fetched successfully');
  });

  getLatest = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    
    logger.info(`Get latest credit score endpoint called for user: ${userId}`);

    const creditScore = await creditService.getLatestCreditScore(userId);

    return ResponseUtil.success(res, creditScore, 'Latest credit score fetched successfully');
  });

  getFactors = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    logger.info(`Get credit factors endpoint called for score: ${id}`);

    const factors = await creditService.getCreditFactors(userId, id);

    return ResponseUtil.success(res, factors, 'Credit factors fetched successfully');
  });

  deleteScore = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    logger.info(`Delete credit score endpoint called: ${id}`);

    const result = await creditService.deleteCreditScore(userId, id);

    return ResponseUtil.success(res, result, 'Credit score deleted successfully');
  });

  getStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    
    logger.info(`Get credit score stats endpoint called for user: ${userId}`);

    const stats = await creditService.getCreditScoreStats(userId);

    return ResponseUtil.success(res, stats, 'Credit score stats fetched successfully');
  });
}
