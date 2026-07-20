import api from '@utils/api';
import type {
  ApiResponse,
  Portfolio,
  Investment,
  InvestmentRecommendation,
} from '@types/index';

export const investmentService = {
  // Portfolio methods
  portfolio: {
    // Create portfolio
    create: async (data: {
      name: string;
      description?: string;
      cashBalance?: number;
      riskTolerance?: string;
      investmentHorizon?: string;
    }): Promise<Portfolio> => {
      const response = await api.post<ApiResponse<Portfolio>>('/investment/portfolio', data);
      return response.data.data!;
    },

    // Get all portfolios
    getAll: async (): Promise<Portfolio[]> => {
      const response = await api.get<ApiResponse<Portfolio[]>>('/investment/portfolio');
      return response.data.data!;
    },

    // Get portfolio by ID
    getById: async (id: string): Promise<Portfolio> => {
      const response = await api.get<ApiResponse<Portfolio>>(`/investment/portfolio/${id}`);
      return response.data.data!;
    },

    // Update portfolio
    update: async (id: string, data: Partial<Portfolio>): Promise<Portfolio> => {
      const response = await api.put<ApiResponse<Portfolio>>(
        `/investment/portfolio/${id}`,
        data
      );
      return response.data.data!;
    },

    // Delete portfolio
    delete: async (id: string): Promise<{ message: string }> => {
      const response = await api.delete<ApiResponse>(`/investment/portfolio/${id}`);
      return response.data.data!;
    },

    // Get portfolio stats
    getStats: async (id: string): Promise<{
      portfolioId: string;
      name: string;
      totalValue: number;
      cashBalance: number;
      investmentValue: number;
      totalProfitLoss: number;
      totalReturn: number;
      totalReturnPercent: number;
      numInvestments: number;
      assetAllocation: Record<string, number>;
      riskTolerance: string;
    }> => {
      const response = await api.get<ApiResponse>(`/investment/portfolio/${id}/stats`);
      return response.data.data!;
    },
  },

  // Investment methods
  investment: {
    // Add investment
    add: async (data: {
      portfolioId?: string;
      symbol: string;
      name: string;
      type: string;
      quantity: number;
      purchasePrice: number;
      currentPrice?: number;
    }): Promise<Investment> => {
      const response = await api.post<ApiResponse<Investment>>('/investment/investment', data);
      return response.data.data!;
    },

    // Get all investments
    getAll: async (params?: { portfolioId?: string }): Promise<Investment[]> => {
      const response = await api.get<ApiResponse<Investment[]>>('/investment/investment', {
        params,
      });
      return response.data.data!;
    },

    // Get investment by ID
    getById: async (id: string): Promise<Investment> => {
      const response = await api.get<ApiResponse<Investment>>(`/investment/investment/${id}`);
      return response.data.data!;
    },

    // Update investment
    update: async (
      id: string,
      data: { quantity?: number; currentPrice?: number }
    ): Promise<Investment> => {
      const response = await api.put<ApiResponse<Investment>>(
        `/investment/investment/${id}`,
        data
      );
      return response.data.data!;
    },

    // Delete investment
    delete: async (id: string): Promise<{ message: string }> => {
      const response = await api.delete<ApiResponse>(`/investment/investment/${id}`);
      return response.data.data!;
    },
  },

  // Get investment recommendations
  getRecommendations: async (params?: {
    riskTolerance?: string;
    investmentAmount?: number;
    horizon?: string;
  }): Promise<InvestmentRecommendation[]> => {
    const response = await api.get<ApiResponse<InvestmentRecommendation[]>>(
      '/investment/recommendations',
      { params }
    );
    return response.data.data!;
  },

  // Get investment analytics
  getAnalytics: async (): Promise<{
    totalInvested: number;
    currentValue: number;
    totalProfitLoss: number;
    totalReturnPercent: number;
    numInvestments: number;
    assetAllocation: Record<string, number>;
    topPerformers: Array<{
      symbol: string;
      name: string;
      profitLoss: number;
      profitLossPercent: number;
    }>;
  }> => {
    const response = await api.get<ApiResponse>('/investment/analytics');
    return response.data.data!;
  },
};
