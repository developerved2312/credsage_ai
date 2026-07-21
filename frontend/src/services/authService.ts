import { signIn, signUp, signOut } from '@lib/auth.client';
import api from '@utils/api';
import type { ApiResponse, User } from '@appTypes/index';

export const authService = {
  // Sign up with email and password
  register: async (data: {
    email: string;
    password: string;
    name: string;
  }) => {
    return signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    });
  },

  // Sign in with email and password
  login: async (data: { email: string; password: string }) => {
    return signIn.email({
      email: data.email,
      password: data.password,
    });
  },

  // Sign in with Google
  loginWithGoogle: async () => {
    return signIn.social({
      provider: 'google',
      callbackURL: '/dashboard',
    });
  },

  // Sign out
  logout: async () => {
    return signOut();
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
