import { Router } from 'express';
import { CreditController } from './credit.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  calculateCreditScoreSchema,
  getCreditHistorySchema,
  getCreditScoreSchema,
} from './credit.validation';

const router = Router();
const creditController = new CreditController();

// All routes require authentication
router.use(authenticate);

// Calculate credit score
router.post('/score', validate(calculateCreditScoreSchema), creditController.calculateScore);

// Get credit history
router.get('/history', validate(getCreditHistorySchema), creditController.getHistory);

// Get latest credit score
router.get('/latest', creditController.getLatest);

// Get credit score stats
router.get('/stats', creditController.getStats);

// Get specific credit score by ID
router.get('/:id', validate(getCreditScoreSchema), creditController.getById);

// Get credit factors (SHAP explanations)
router.get('/:id/factors', validate(getCreditScoreSchema), creditController.getFactors);

// Delete credit score
router.delete('/:id', validate(getCreditScoreSchema), creditController.deleteScore);

export default router;
