import { Logger } from '../utils/logger';
import { z } from 'zod';

const logger = new Logger('RecommendationService');

// Zod validation schema for recommendation input
const RecommendationInputSchema = z.object({
  userId: z.string().uuid(),
  riskTolerance: z.enum(['low', 'medium', 'high']),
  investmentAmount: z.number().positive(),
  horizon: z.enum(['short', 'medium', 'long']),
  currentPortfolios: z.array(z.any()),
  creditScore: z.number().int().min(300).max(850).optional(),
});

export type RecommendationInput = z.infer<typeof RecommendationInputSchema>;

export interface InvestmentRecommendation {
  symbol: string;
  name: string;
  type: string;
  recommendedAllocation: number;
  recommendedAmount: number;
  riskLevel: string;
  expectedReturn: number;
  reasoningPoints: string[];
  score: number;
}

export class RecommendationService {
  async getInvestmentRecommendations(
    input: RecommendationInput
  ): Promise<InvestmentRecommendation[]> {
    logger.info(`Generating investment recommendations for user: ${input.userId}`);

    // Validate input with Zod
    const validatedInput = RecommendationInputSchema.parse(input);

    // This is a simplified recommendation engine
    // In production, this would call an ML model or sophisticated algorithm
    const recommendations: InvestmentRecommendation[] = [];

    const riskProfile = this.getRiskProfile(validatedInput.riskTolerance, validatedInput.creditScore);

    // Build recommendations based on risk tolerance
    if (validatedInput.riskTolerance === 'low') {
      recommendations.push(
        {
          symbol: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          type: 'etf',
          recommendedAllocation: 0.4,
          recommendedAmount: input.investmentAmount * 0.4,
          riskLevel: 'low',
          expectedReturn: 3.5,
          reasoningPoints: [
            'Low volatility bond fund',
            'Diversified fixed income exposure',
            'Suitable for conservative investors',
          ],
          score: 0.92,
        },
        {
          symbol: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          type: 'etf',
          recommendedAllocation: 0.3,
          recommendedAmount: input.investmentAmount * 0.3,
          riskLevel: 'medium',
          expectedReturn: 7.0,
          reasoningPoints: [
            'Broad market exposure',
            'Low expense ratio',
            'Long-term growth potential',
          ],
          score: 0.88,
        },
        {
          symbol: 'VNQ',
          name: 'Vanguard Real Estate ETF',
          type: 'etf',
          recommendedAllocation: 0.2,
          recommendedAmount: input.investmentAmount * 0.2,
          riskLevel: 'medium',
          expectedReturn: 5.5,
          reasoningPoints: [
            'Real estate diversification',
            'Inflation hedge',
            'Income generation',
          ],
          score: 0.85,
        },
        {
          symbol: 'VCSH',
          name: 'Vanguard Short-Term Corporate Bond ETF',
          type: 'etf',
          recommendedAllocation: 0.1,
          recommendedAmount: input.investmentAmount * 0.1,
          riskLevel: 'low',
          expectedReturn: 3.0,
          reasoningPoints: [
            'Short duration bonds',
            'Less interest rate sensitive',
            'Stable income',
          ],
          score: 0.87,
        }
      );
    } else if (input.riskTolerance === 'medium') {
      recommendations.push(
        {
          symbol: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          type: 'etf',
          recommendedAllocation: 0.4,
          recommendedAmount: input.investmentAmount * 0.4,
          riskLevel: 'medium',
          expectedReturn: 7.0,
          reasoningPoints: [
            'Broad US market exposure',
            'Balanced growth potential',
            'Low cost diversification',
          ],
          score: 0.90,
        },
        {
          symbol: 'VXUS',
          name: 'Vanguard Total International Stock ETF',
          type: 'etf',
          recommendedAllocation: 0.25,
          recommendedAmount: input.investmentAmount * 0.25,
          riskLevel: 'medium',
          expectedReturn: 6.5,
          reasoningPoints: [
            'International diversification',
            'Exposure to global markets',
            'Currency diversification',
          ],
          score: 0.87,
        },
        {
          symbol: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          type: 'etf',
          recommendedAllocation: 0.25,
          recommendedAmount: input.investmentAmount * 0.25,
          riskLevel: 'low',
          expectedReturn: 3.5,
          reasoningPoints: [
            'Portfolio stability',
            'Income generation',
            'Balances equity risk',
          ],
          score: 0.88,
        },
        {
          symbol: 'VGT',
          name: 'Vanguard Information Technology ETF',
          type: 'etf',
          recommendedAllocation: 0.1,
          recommendedAmount: input.investmentAmount * 0.1,
          riskLevel: 'high',
          expectedReturn: 10.0,
          reasoningPoints: [
            'Technology sector growth',
            'Innovation exposure',
            'Long-term potential',
          ],
          score: 0.85,
        }
      );
    } else {
      // High risk tolerance
      recommendations.push(
        {
          symbol: 'QQQ',
          name: 'Invesco QQQ Trust',
          type: 'etf',
          recommendedAllocation: 0.35,
          recommendedAmount: input.investmentAmount * 0.35,
          riskLevel: 'high',
          expectedReturn: 12.0,
          reasoningPoints: [
            'NASDAQ-100 exposure',
            'Technology-heavy portfolio',
            'High growth potential',
          ],
          score: 0.89,
        },
        {
          symbol: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          type: 'etf',
          recommendedAllocation: 0.25,
          recommendedAmount: input.investmentAmount * 0.25,
          riskLevel: 'medium',
          expectedReturn: 7.0,
          reasoningPoints: [
            'Market-wide diversification',
            'Core portfolio holding',
            'Balanced exposure',
          ],
          score: 0.88,
        },
        {
          symbol: 'VGT',
          name: 'Vanguard Information Technology ETF',
          type: 'etf',
          recommendedAllocation: 0.2,
          recommendedAmount: input.investmentAmount * 0.2,
          riskLevel: 'high',
          expectedReturn: 10.0,
          reasoningPoints: [
            'Tech sector dominance',
            'Innovation leaders',
            'Growth opportunities',
          ],
          score: 0.86,
        },
        {
          symbol: 'VUG',
          name: 'Vanguard Growth ETF',
          type: 'etf',
          recommendedAllocation: 0.15,
          recommendedAmount: input.investmentAmount * 0.15,
          riskLevel: 'high',
          expectedReturn: 9.5,
          reasoningPoints: [
            'Growth stock focus',
            'Capital appreciation',
            'Strong historical returns',
          ],
          score: 0.84,
        },
        {
          symbol: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          type: 'etf',
          recommendedAllocation: 0.05,
          recommendedAmount: input.investmentAmount * 0.05,
          riskLevel: 'low',
          expectedReturn: 3.5,
          reasoningPoints: [
            'Minor portfolio stabilization',
            'Risk management',
            'Income component',
          ],
          score: 0.80,
        }
      );
    }

    // Adjust for investment horizon
    if (input.horizon === 'short') {
      // Recommend more conservative options for short-term
      recommendations.forEach((rec) => {
        if (rec.riskLevel === 'high') {
          rec.score *= 0.8;
          rec.recommendedAllocation *= 0.7;
        }
      });
    }

    logger.info(`Generated ${recommendations.length} recommendations`);

    return recommendations.sort((a, b) => b.score - a.score);
  }

  private getRiskProfile(riskTolerance: string, creditScore?: number) {
    // Adjust risk profile based on credit score
    let adjustedRisk = riskTolerance;

    if (creditScore && creditScore < 650) {
      // Lower risk tolerance for lower credit scores
      if (riskTolerance === 'high') adjustedRisk = 'medium';
      if (riskTolerance === 'medium') adjustedRisk = 'low';
    }

    return {
      tolerance: adjustedRisk,
      maxEquityAllocation: adjustedRisk === 'low' ? 0.6 : adjustedRisk === 'medium' ? 0.8 : 0.95,
      recommendBonds: adjustedRisk === 'low',
    };
  }
}
