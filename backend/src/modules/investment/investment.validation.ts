import { z } from 'zod';

export const createPortfolioSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Portfolio name is required'),
    description: z.string().optional(),
    cashBalance: z.number().min(0, 'Cash balance cannot be negative').optional(),
    riskTolerance: z.enum(['low', 'medium', 'high']).optional(),
    investmentHorizon: z.enum(['short', 'medium', 'long']).optional(),
  }),
});

export const updatePortfolioSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid portfolio ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Portfolio name cannot be empty').optional(),
    description: z.string().optional(),
    cashBalance: z.number().min(0, 'Cash balance cannot be negative').optional(),
    riskTolerance: z.enum(['low', 'medium', 'high']).optional(),
    investmentHorizon: z.enum(['short', 'medium', 'long']).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getPortfolioSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid portfolio ID'),
  }),
});

export const addInvestmentSchema = z.object({
  body: z.object({
    portfolioId: z.string().uuid('Invalid portfolio ID').optional(),
    symbol: z.string().min(1, 'Symbol is required').max(20, 'Symbol too long'),
    name: z.string().min(1, 'Investment name is required'),
    type: z.enum(['stock', 'etf', 'bond', 'crypto', 'other'], {
      errorMap: () => ({ message: 'Invalid investment type' }),
    }),
    quantity: z.number().positive('Quantity must be positive'),
    purchasePrice: z.number().positive('Purchase price must be positive'),
    currentPrice: z.number().positive('Current price must be positive').optional(),
  }),
});

export const updateInvestmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid investment ID'),
  }),
  body: z.object({
    quantity: z.number().positive('Quantity must be positive').optional(),
    currentPrice: z.number().positive('Current price must be positive').optional(),
  }),
});

export const getInvestmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid investment ID'),
  }),
});

export const getRecommendationsSchema = z.object({
  query: z.object({
    riskTolerance: z.enum(['low', 'medium', 'high']).optional(),
    investmentAmount: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    horizon: z.enum(['short', 'medium', 'long']).optional(),
  }),
});
