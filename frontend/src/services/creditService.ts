import api from '@utils/api';
import type { ApiResponse, CreditScore, CreditScoreInput, PaginatedResponse } from '@appTypes/index';

export const creditService = {
  // Calculate credit score
  calculateScore: async (data: CreditScoreInput): Promise<CreditScore> => {
    const response = await api.post<ApiResponse<CreditScore>>('/credit/score', data);
    return response.data.data!;
  },

  // Get credit history
  getHistory: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<CreditScore>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<CreditScore>>>(
      '/credit/history',
      { params }
    );
    return response.data.data!;
  },

  // Get latest credit score
  getLatest: async (): Promise<CreditScore> => {
    const response = await api.get<ApiResponse<CreditScore>>('/credit/latest');
    return response.data.data!;
  },

  // Get credit score by ID
  getById: async (id: string): Promise<CreditScore> => {
    const response = await api.get<ApiResponse<CreditScore>>(`/credit/${id}`);
    return response.data.data!;
  },

  // Get credit factors (SHAP explanations)
  getFactors: async (id: string): Promise<{
    creditScoreId: string;
    score: number;
    scoreCategory: string;
    confidence: number;
    shapValues: Record<string, number>;
    topFactors: Array<{ factor: string; impact: string; value: number }>;
  }> => {
    const response = await api.get<ApiResponse>(`/credit/${id}/factors`);
    return response.data.data!;
  },

  // Delete credit score
  deleteScore: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<ApiResponse>(`/credit/${id}`);
    return response.data.data!;
  },

  // Get credit score stats
  getStats: async (): Promise<{
    totalScores: number;
    latestScore: CreditScore | null;
    averageScore: number | null;
    highestScore: number | null;
    lowestScore: number | null;
    trend: 'up' | 'down' | 'stable' | null;
  }> => {
    const response = await api.get<ApiResponse>('/credit/stats');
    return response.data.data!;
  },
};
