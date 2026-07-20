import { prisma } from '../../config/prisma';
import { RecommendationService } from '../../services/recommendation.service';
import { AppError } from '../../middleware/error.middleware';
import { Logger } from '../../utils/logger';
import { Prisma } from '@prisma/client';

const logger = new Logger('InvestmentService');

export interface CreatePortfolioInput {
  name: string;
  description?: string;
  cashBalance?: number;
  riskTolerance?: string;
  investmentHorizon?: string;
}

export interface UpdatePortfolioInput {
  name?: string;
  description?: string;
  cashBalance?: number;
  riskTolerance?: string;
  investmentHorizon?: string;
  isActive?: boolean;
}

export interface AddInvestmentInput {
  portfolioId?: string;
  symbol: string;
  name: string;
  type: string;
  quantity: number;
  purchasePrice: number;
  currentPrice?: number;
}

export interface UpdateInvestmentInput {
  quantity?: number;
  currentPrice?: number;
}

export interface RecommendationQuery {
  riskTolerance?: string;
  investmentAmount?: number;
  horizon?: string;
}

export class InvestmentService {
  private recommendationService: RecommendationService;

  constructor() {
    this.recommendationService = new RecommendationService();
  }

  // Portfolio methods
  async createPortfolio(userId: string, input: CreatePortfolioInput) {
    logger.info(`Creating portfolio for user: ${userId}`);

    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        name: input.name,
        description: input.description,
        cashBalance: input.cashBalance ? new Prisma.Decimal(input.cashBalance) : new Prisma.Decimal(0),
        totalValue: input.cashBalance ? new Prisma.Decimal(input.cashBalance) : new Prisma.Decimal(0),
        riskTolerance: input.riskTolerance || 'medium',
        investmentHorizon: input.investmentHorizon,
      },
    });

    logger.info(`Portfolio created: ${portfolio.id}`);
    return portfolio;
  }

  async getPortfolios(userId: string) {
    logger.info(`Fetching portfolios for user: ${userId}`);

    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: {
        investments: {
          select: {
            id: true,
            symbol: true,
            name: true,
            type: true,
            quantity: true,
            currentPrice: true,
            totalValue: true,
            profitLoss: true,
            profitLossPercent: true,
          },
        },
        _count: {
          select: { investments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return portfolios;
  }

  async getPortfolioById(userId: string, portfolioId: string) {
    logger.info(`Fetching portfolio: ${portfolioId}`);

    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId,
      },
      include: {
        investments: true,
      },
    });

    if (!portfolio) {
      throw new AppError(404, 'Portfolio not found');
    }

    return portfolio;
  }

  async updatePortfolio(userId: string, portfolioId: string, input: UpdatePortfolioInput) {
    logger.info(`Updating portfolio: ${portfolioId}`);

    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
    });

    if (!portfolio) {
      throw new AppError(404, 'Portfolio not found');
    }

    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        name: input.name,
        description: input.description,
        cashBalance: input.cashBalance ? new Prisma.Decimal(input.cashBalance) : undefined,
        riskTolerance: input.riskTolerance,
        investmentHorizon: input.investmentHorizon,
        isActive: input.isActive,
      },
    });

    logger.info(`Portfolio updated: ${portfolioId}`);
    return updatedPortfolio;
  }

  async deletePortfolio(userId: string, portfolioId: string) {
    logger.info(`Deleting portfolio: ${portfolioId}`);

    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
    });

    if (!portfolio) {
      throw new AppError(404, 'Portfolio not found');
    }

    await prisma.portfolio.delete({
      where: { id: portfolioId },
    });

    logger.info(`Portfolio deleted: ${portfolioId}`);
    return { message: 'Portfolio deleted successfully' };
  }

  async getPortfolioStats(userId: string, portfolioId: string) {
    logger.info(`Fetching portfolio stats: ${portfolioId}`);

    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
      include: {
        investments: true,
      },
    });

    if (!portfolio) {
      throw new AppError(404, 'Portfolio not found');
    }

    const totalInvestmentValue = portfolio.investments.reduce(
      (sum, inv) => sum + Number(inv.totalValue || 0),
      0
    );

    const totalProfitLoss = portfolio.investments.reduce(
      (sum, inv) => sum + Number(inv.profitLoss || 0),
      0
    );

    const assetAllocation = portfolio.investments.reduce(
      (acc, inv) => {
        const type = inv.type;
        if (!acc[type]) acc[type] = 0;
        acc[type] += Number(inv.totalValue || 0);
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      portfolioId: portfolio.id,
      name: portfolio.name,
      totalValue: portfolio.totalValue,
      cashBalance: portfolio.cashBalance,
      investmentValue: totalInvestmentValue,
      totalProfitLoss,
      totalReturn: portfolio.totalReturn,
      totalReturnPercent: portfolio.totalReturnPercent,
      numInvestments: portfolio.investments.length,
      assetAllocation,
      riskTolerance: portfolio.riskTolerance,
    };
  }

  // Investment methods
  async addInvestment(userId: string, input: AddInvestmentInput) {
    logger.info(`Adding investment for user: ${userId}`);

    // Verify portfolio ownership if portfolioId provided
    if (input.portfolioId) {
      const portfolio = await prisma.portfolio.findFirst({
        where: { id: input.portfolioId, userId },
      });

      if (!portfolio) {
        throw new AppError(404, 'Portfolio not found');
      }
    }

    const currentPrice = input.currentPrice || input.purchasePrice;
    const totalValue = input.quantity * currentPrice;
    const profitLoss = input.quantity * (currentPrice - input.purchasePrice);
    const profitLossPercent =
      ((currentPrice - input.purchasePrice) / input.purchasePrice) * 100;

    const investment = await prisma.investment.create({
      data: {
        userId,
        portfolioId: input.portfolioId,
        symbol: input.symbol,
        name: input.name,
        type: input.type,
        quantity: new Prisma.Decimal(input.quantity),
        purchasePrice: new Prisma.Decimal(input.purchasePrice),
        currentPrice: new Prisma.Decimal(currentPrice),
        totalValue: new Prisma.Decimal(totalValue),
        profitLoss: new Prisma.Decimal(profitLoss),
        profitLossPercent: new Prisma.Decimal(profitLossPercent),
      },
    });

    // Update portfolio total value if portfolioId exists
    if (input.portfolioId) {
      await this.updatePortfolioTotalValue(input.portfolioId);
    }

    logger.info(`Investment added: ${investment.id}`);
    return investment;
  }

  async getInvestments(userId: string, portfolioId?: string) {
    logger.info(`Fetching investments for user: ${userId}`);

    const investments = await prisma.investment.findMany({
      where: {
        userId,
        ...(portfolioId ? { portfolioId } : {}),
      },
      include: {
        portfolio: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return investments;
  }

  async getInvestmentById(userId: string, investmentId: string) {
    logger.info(`Fetching investment: ${investmentId}`);

    const investment = await prisma.investment.findFirst({
      where: {
        id: investmentId,
        userId,
      },
      include: {
        portfolio: true,
      },
    });

    if (!investment) {
      throw new AppError(404, 'Investment not found');
    }

    return investment;
  }

  async updateInvestment(userId: string, investmentId: string, input: UpdateInvestmentInput) {
    logger.info(`Updating investment: ${investmentId}`);

    const investment = await prisma.investment.findFirst({
      where: { id: investmentId, userId },
    });

    if (!investment) {
      throw new AppError(404, 'Investment not found');
    }

    const quantity = input.quantity !== undefined ? input.quantity : Number(investment.quantity);
    const currentPrice =
      input.currentPrice !== undefined ? input.currentPrice : Number(investment.currentPrice);
    const purchasePrice = Number(investment.purchasePrice);

    const totalValue = quantity * currentPrice;
    const profitLoss = quantity * (currentPrice - purchasePrice);
    const profitLossPercent = ((currentPrice - purchasePrice) / purchasePrice) * 100;

    const updatedInvestment = await prisma.investment.update({
      where: { id: investmentId },
      data: {
        quantity: input.quantity ? new Prisma.Decimal(input.quantity) : undefined,
        currentPrice: input.currentPrice ? new Prisma.Decimal(input.currentPrice) : undefined,
        totalValue: new Prisma.Decimal(totalValue),
        profitLoss: new Prisma.Decimal(profitLoss),
        profitLossPercent: new Prisma.Decimal(profitLossPercent),
      },
    });

    // Update portfolio total value if portfolioId exists
    if (investment.portfolioId) {
      await this.updatePortfolioTotalValue(investment.portfolioId);
    }

    logger.info(`Investment updated: ${investmentId}`);
    return updatedInvestment;
  }

  async deleteInvestment(userId: string, investmentId: string) {
    logger.info(`Deleting investment: ${investmentId}`);

    const investment = await prisma.investment.findFirst({
      where: { id: investmentId, userId },
    });

    if (!investment) {
      throw new AppError(404, 'Investment not found');
    }

    const portfolioId = investment.portfolioId;

    await prisma.investment.delete({
      where: { id: investmentId },
    });

    // Update portfolio total value if portfolioId exists
    if (portfolioId) {
      await this.updatePortfolioTotalValue(portfolioId);
    }

    logger.info(`Investment deleted: ${investmentId}`);
    return { message: 'Investment deleted successfully' };
  }

  // Recommendation methods
  async getRecommendations(userId: string, query: RecommendationQuery) {
    logger.info(`Getting recommendations for user: ${userId}`);

    // Get user's portfolio information
    const portfolios = await prisma.portfolio.findMany({
      where: { userId, isActive: true },
      include: { investments: true },
    });

    // Get user's credit score for risk assessment
    const latestCreditScore = await prisma.creditScore.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const recommendations = await this.recommendationService.getInvestmentRecommendations({
      userId,
      riskTolerance: query.riskTolerance || 'medium',
      investmentAmount: query.investmentAmount || 10000,
      horizon: query.horizon || 'long',
      currentPortfolios: portfolios,
      creditScore: latestCreditScore?.score,
    });

    return recommendations;
  }

  async getInvestmentAnalytics(userId: string) {
    logger.info(`Fetching investment analytics for user: ${userId}`);

    const investments = await prisma.investment.findMany({
      where: { userId },
    });

    const totalInvested = investments.reduce(
      (sum, inv) => sum + Number(inv.quantity) * Number(inv.purchasePrice),
      0
    );

    const currentValue = investments.reduce((sum, inv) => sum + Number(inv.totalValue || 0), 0);

    const totalProfitLoss = investments.reduce((sum, inv) => sum + Number(inv.profitLoss || 0), 0);

    const totalReturnPercent =
      totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;

    const assetAllocation = investments.reduce(
      (acc, inv) => {
        const type = inv.type;
        if (!acc[type]) acc[type] = 0;
        acc[type] += Number(inv.totalValue || 0);
        return acc;
      },
      {} as Record<string, number>
    );

    const topPerformers = investments
      .sort((a, b) => Number(b.profitLossPercent || 0) - Number(a.profitLossPercent || 0))
      .slice(0, 5)
      .map((inv) => ({
        symbol: inv.symbol,
        name: inv.name,
        profitLoss: inv.profitLoss,
        profitLossPercent: inv.profitLossPercent,
      }));

    return {
      totalInvested,
      currentValue,
      totalProfitLoss,
      totalReturnPercent,
      numInvestments: investments.length,
      assetAllocation,
      topPerformers,
    };
  }

  private async updatePortfolioTotalValue(portfolioId: string) {
    const investments = await prisma.investment.findMany({
      where: { portfolioId },
    });

    const totalInvestmentValue = investments.reduce(
      (sum, inv) => sum + Number(inv.totalValue || 0),
      0
    );

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (portfolio) {
      const totalValue = Number(portfolio.cashBalance) + totalInvestmentValue;
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: { totalValue: new Prisma.Decimal(totalValue) },
      });
    }
  }
}
