import { z } from 'zod';

export const calculateCreditScoreSchema = z.object({
  body: z.object({
    age: z.number().int().min(18, 'Age must be at least 18').max(100, 'Age must be less than 100'),
    income: z.number().positive('Income must be positive'),
    employmentLength: z.number().int().min(0, 'Employment length cannot be negative'),
    loanAmount: z.number().positive('Loan amount must be positive'),
    loanTerm: z.number().int().positive('Loan term must be positive'),
    homeOwnership: z.enum(['RENT', 'OWN', 'MORTGAGE', 'OTHER'], {
      errorMap: () => ({ message: 'Invalid home ownership status' }),
    }),
    loanPurpose: z.enum([
      'debt_consolidation',
      'credit_card',
      'home_improvement',
      'major_purchase',
      'small_business',
      'car',
      'medical',
      'moving',
      'vacation',
      'house',
      'wedding',
      'renewable_energy',
      'other',
    ], {
      errorMap: () => ({ message: 'Invalid loan purpose' }),
    }),
    debtToIncome: z.number().min(0).max(1, 'Debt-to-income ratio must be between 0 and 1'),
    creditHistory: z.number().int().min(0, 'Credit history cannot be negative'),
    numCreditLines: z.number().int().min(0, 'Number of credit lines cannot be negative'),
    numOpenAccounts: z.number().int().min(0, 'Number of open accounts cannot be negative'),
    totalDebt: z.number().min(0, 'Total debt cannot be negative'),
  }),
});

export const getCreditHistorySchema = z.object({
  query: z.object({
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    offset: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 0)),
  }),
});

export const getCreditScoreSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid credit score ID'),
  }),
});
