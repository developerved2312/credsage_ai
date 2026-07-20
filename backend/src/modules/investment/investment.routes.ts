import { Router } from 'express';
import { InvestmentController } from './investment.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  createPortfolioSchema,
  updatePortfolioSchema,
  addInvestmentSchema,
  updateInvestmentSchema,
  getPortfolioSchema,
  getInvestmentSchema,
  getRecommendationsSchema,
} from './investment.validation';

const router = Router();
const investmentController = new InvestmentController();

// All routes require authentication
router.use(authenticate);

// Portfolio routes
router.post('/portfolio', validate(createPortfolioSchema), investmentController.createPortfolio);
router.get('/portfolio', investmentController.getPortfolios);
router.get('/portfolio/:id', validate(getPortfolioSchema), investmentController.getPortfolioById);
router.put('/portfolio/:id', validate(updatePortfolioSchema), investmentController.updatePortfolio);
router.delete('/portfolio/:id', validate(getPortfolioSchema), investmentController.deletePortfolio);
router.get('/portfolio/:id/stats', validate(getPortfolioSchema), investmentController.getPortfolioStats);

// Investment routes
router.post('/investment', validate(addInvestmentSchema), investmentController.addInvestment);
router.get('/investment', investmentController.getInvestments);
router.get('/investment/:id', validate(getInvestmentSchema), investmentController.getInvestmentById);
router.put('/investment/:id', validate(updateInvestmentSchema), investmentController.updateInvestment);
router.delete('/investment/:id', validate(getInvestmentSchema), investmentController.deleteInvestment);

// Recommendation routes
router.get('/recommendations', validate(getRecommendationsSchema), investmentController.getRecommendations);
router.get('/analytics', investmentController.getAnalytics);

export default router;
