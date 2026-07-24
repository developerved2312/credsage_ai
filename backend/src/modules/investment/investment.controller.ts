import { Request, Response } from 'express';
import { InvestmentService } from './investment.service';
import { ResponseUtil } from '../../utils/response';
import { asyncHandler } from '../../middleware/error.middleware';
import { Logger } from '../../utils/logger';

const logger = new Logger('InvestmentController');
const investmentService = new InvestmentService();

export class InvestmentController {
  // Portfolio controllers
  createPortfolio = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info(`Create portfolio endpoint called for user: ${userId}`);

    const portfolio = await investmentService.createPortfolio(userId, req.body);

    return ResponseUtil.created(res, portfolio, 'Portfolio created successfully');
  });

  getPortfolios = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info(`Get portfolios endpoint called for user: ${userId}`);

    const portfolios = await investmentService.getPortfolios(userId);

    return ResponseUtil.success(res, portfolios, 'Portfolios fetched successfully');
  });

  getPortfolioById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    logger.info(`Get portfolio by ID endpoint called: ${id}`);

    const portfolio = await investmentService.getPortfolioById(userId, id);

    return ResponseUtil.success(res, portfolio, 'Portfolio fetched successfully');
  });

  updatePortfolio = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    logger.info(`Update portfolio endpoint called: ${id}`);

    const portfolio = await investmentService.updatePortfolio(userId, id, req.body);

    return ResponseUtil.success(res, portfolio, 'Portfolio updated successfully');
  });

  deletePortfolio = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    logger.info(`Delete portfolio endpoint called: ${id}`);

    const result = await investmentService.deletePortfolio(userId, id);

    return ResponseUtil.success(res, result, 'Portfolio deleted successfully');
  });

  getPortfolioStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    logger.info(`Get portfolio stats endpoint called: ${id}`);

    const stats = await investmentService.getPortfolioStats(userId, id);

    return ResponseUtil.success(res, stats, 'Portfolio stats fetched successfully');
  });

  // Investment controllers
  addInvestment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info(`Add investment endpoint called for user: ${userId}`);

    const investment = await investmentService.addInvestment(userId, req.body);

    return ResponseUtil.created(res, investment, 'Investment added successfully');
  });

  getInvestments = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { portfolioId } = req.query;
    logger.info(`Get investments endpoint called for user: ${userId}`);

    const investments = await investmentService.getInvestments(
      userId,
      portfolioId as string | undefined
    );

    return ResponseUtil.success(res, investments, 'Investments fetched successfully');
  });

  getInvestmentById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    logger.info(`Get investment by ID endpoint called: ${id}`);

    const investment = await investmentService.getInvestmentById(userId, id);

    return ResponseUtil.success(res, investment, 'Investment fetched successfully');
  });

  updateInvestment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    logger.info(`Update investment endpoint called: ${id}`);

    const investment = await investmentService.updateInvestment(userId, id, req.body);

    return ResponseUtil.success(res, investment, 'Investment updated successfully');
  });

  deleteInvestment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    logger.info(`Delete investment endpoint called: ${id}`);

    const result = await investmentService.deleteInvestment(userId, id);

    return ResponseUtil.success(res, result, 'Investment deleted successfully');
  });

  // Recommendation controllers
  getRecommendations = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { riskTolerance, investmentAmount, horizon } = req.query;
    logger.info(`Get recommendations endpoint called for user: ${userId}`);

    const recommendations = await investmentService.getRecommendations(userId, {
      riskTolerance: riskTolerance as string | undefined,
      investmentAmount: investmentAmount ? Number(investmentAmount) : undefined,
      horizon: horizon as string | undefined,
    });

    return ResponseUtil.success(res, recommendations, 'Recommendations fetched successfully');
  });

  getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info(`Get analytics endpoint called for user: ${userId}`);

    const analytics = await investmentService.getInvestmentAnalytics(userId);

    return ResponseUtil.success(res, analytics, 'Analytics fetched successfully');
  });
}
