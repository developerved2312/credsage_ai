import { z } from 'zod';

export const calculateCreditScoreSchema = z.object({
  body: z.object({
    recharge_freq_per_month: z.number().min(0), avg_recharge_value: z.number().min(0), recharge_gap_std: z.number().min(0),
    bill_on_time_ratio: z.number().min(0).max(1), avg_days_late: z.number().min(0), autopay_enrolled: z.boolean(),
    monthly_spend_volatility: z.number().min(0), emi_usage_rate: z.number().min(0).max(1), order_freq_trend: z.number(), phone_tenure_months: z.number().int().min(0),
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
