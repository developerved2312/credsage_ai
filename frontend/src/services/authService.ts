import api from '@utils/api';
import type { ApiResponse, AuthResponse, User } from '@types/index';

export const authService = {
  // Register new user
  register: async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/users/register', data);
    return response.data.data!;
  },

  // Login user
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/users/login', data);
    return response.data.data!;
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    return response.data.data!;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/users/profile', data);
    return response.data.data!;
  },

  // Change password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await api.post<ApiResponse>('/users/change-password', data);
    return response.data.data!;
  },

  // Get user stats
  getUserStats: async (): Promise<{
    creditScores: number;
    investments: number;
    portfolios: number;
    chatMessages: number;
  }> => {
    const response = await api.get<ApiResponse>('/users/stats');
    return response.data.data!;
  },
};
