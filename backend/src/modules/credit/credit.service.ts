import { prisma } from '../../config/prisma';
import { MLService } from '../../services/ml.service';
import { AppError } from '../../middleware/error.middleware';
import { Logger } from '../../utils/logger';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const logger = new Logger('CreditService');

// Zod validation schema for credit score input
export const CreditScoreInputSchema = z.object({
  recharge_freq_per_month: z.number().min(0), avg_recharge_value: z.number().min(0), recharge_gap_std: z.number().min(0),
  bill_on_time_ratio: z.number().min(0).max(1), avg_days_late: z.number().min(0), autopay_enrolled: z.boolean(),
  monthly_spend_volatility: z.number().min(0), emi_usage_rate: z.number().min(0).max(1), order_freq_trend: z.number(), phone_tenure_months: z.number().int().min(0),
});

export type CreditScoreInput = z.infer<typeof CreditScoreInputSchema>;

/**
 * Credit Service - Business logic for credit score operations
 * Uses MLService (third-party service) for predictions
 */
export class CreditService {
  private mlService: MLService;

  constructor() {
    this.mlService = new MLService();
  }

  async calculateCreditScore(userId: string, input: CreditScoreInput) {
    logger.info(`Calculating credit score for user: ${userId}`);

    // Validate input with Zod
    const validatedInput = CreditScoreInputSchema.parse(input);

    // Call ML service for prediction
    const prediction = await this.mlService.predictCreditScore(validatedInput);

    // Save credit score to database with Prisma 7 Decimal
    const creditScore = await prisma.creditScore.create({
      data: {
        userId,
        score: prediction.score,
        scoreCategory: prediction.scoreCategory,
        rechargeFreqPerMonth: new Prisma.Decimal(validatedInput.recharge_freq_per_month), avgRechargeValue: new Prisma.Decimal(validatedInput.avg_recharge_value), rechargeGapStd: new Prisma.Decimal(validatedInput.recharge_gap_std),
        billOnTimeRatio: new Prisma.Decimal(validatedInput.bill_on_time_ratio), avgDaysLate: new Prisma.Decimal(validatedInput.avg_days_late), autopayEnrolled: validatedInput.autopay_enrolled,
        monthlySpendVolatility: new Prisma.Decimal(validatedInput.monthly_spend_volatility), emiUsageRate: new Prisma.Decimal(validatedInput.emi_usage_rate), orderFreqTrend: new Prisma.Decimal(validatedInput.order_freq_trend), phoneTenureMonths: validatedInput.phone_tenure_months,
        modelVersion: prediction.modelVersion,
        confidence: new Prisma.Decimal(prediction.confidence),
        shapValues: prediction.shapValues as Prisma.InputJsonValue,
        topFactors: prediction.topFactors as Prisma.InputJsonValue,
      },
    });

    logger.info(`Credit score calculated and saved: ${creditScore.id}`);

    return creditScore;
  }

  async getCreditHistory(userId: string, limit: number = 10, offset: number = 0) {
    logger.info(`Fetching credit history for user: ${userId}`);

    const [creditScores, total] = await Promise.all([
      prisma.creditScore.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          score: true,
          scoreCategory: true,
          confidence: true,
          modelVersion: true,
          createdAt: true,
          topFactors: true,
        },
      }),
      prisma.creditScore.count({ where: { userId } }),
    ]);

    return {
      data: creditScores,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getCreditScoreById(userId: string, creditScoreId: string) {
    logger.info(`Fetching credit score: ${creditScoreId} for user: ${userId}`);

    const creditScore = await prisma.creditScore.findFirst({
      where: {
        id: creditScoreId,
        userId,
      },
    });

    if (!creditScore) {
      throw new AppError(404, 'Credit score not found');
    }

    return creditScore;
  }

  async getLatestCreditScore(userId: string) {
    logger.info(`Fetching latest credit score for user: ${userId}`);

    const creditScore = await prisma.creditScore.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!creditScore) {
      throw new AppError(404, 'No credit score found for this user');
    }

    return creditScore;
  }

  async getCreditFactors(userId: string, creditScoreId: string) {
    logger.info(`Fetching credit factors for score: ${creditScoreId}`);

    const creditScore = await prisma.creditScore.findFirst({
      where: {
        id: creditScoreId,
        userId,
      },
      select: {
        id: true,
        score: true,
        scoreCategory: true,
        shapValues: true,
        topFactors: true,
        confidence: true,
      },
    });

    if (!creditScore) {
      throw new AppError(404, 'Credit score not found');
    }

    return {
      creditScoreId: creditScore.id,
      score: creditScore.score,
      scoreCategory: creditScore.scoreCategory,
      confidence: creditScore.confidence,
      shapValues: creditScore.shapValues,
      topFactors: creditScore.topFactors,
    };
  }

  async deleteCreditScore(userId: string, creditScoreId: string) {
    logger.info(`Deleting credit score: ${creditScoreId} for user: ${userId}`);

    const creditScore = await prisma.creditScore.findFirst({
      where: {
        id: creditScoreId,
        userId,
      },
    });

    if (!creditScore) {
      throw new AppError(404, 'Credit score not found');
    }

    await prisma.creditScore.delete({
      where: { id: creditScoreId },
    });

    logger.info(`Credit score deleted: ${creditScoreId}`);

    return { message: 'Credit score deleted successfully' };
  }

  async getCreditScoreStats(userId: string) {
    logger.info(`Fetching credit score stats for user: ${userId}`);

    const creditScores = await prisma.creditScore.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        score: true,
        scoreCategory: true,
        createdAt: true,
      },
    });

    if (creditScores.length === 0) {
      return {
        totalScores: 0,
        latestScore: null,
        averageScore: null,
        highestScore: null,
        lowestScore: null,
        trend: null,
      };
    }

    const scores = creditScores.map((cs) => cs.score);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    // Calculate trend (comparing latest to previous)
    let trend: 'up' | 'down' | 'stable' | null = null;
    if (creditScores.length >= 2) {
      const latest = creditScores[0].score;
      const previous = creditScores[1].score;
      if (latest > previous) trend = 'up';
      else if (latest < previous) trend = 'down';
      else trend = 'stable';
    }

    return {
      totalScores: creditScores.length,
      latestScore: creditScores[0],
      averageScore: Math.round(average),
      highestScore: highest,
      lowestScore: lowest,
      trend,
    };
  }
}
