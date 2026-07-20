import { useMutation, useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@services/authService';
import { useAuthStore } from '@store/authStore';
import type { User } from '@types/index';

export const useAuth = () => {
  const navigate = useNavigate();
  const { setAuth, clearAuth, user } = useAuthStore();

  // Register mutation
  const registerMutation = useMutation(authService.register, {
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      navigate('/dashboard');
    },
  });

  // Login mutation
  const loginMutation = useMutation(authService.login, {
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      navigate('/dashboard');
    },
  });

  // Logout
  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  // Get profile query
  const { data: profile, refetch: refetchProfile } = useQuery<User>(
    ['user', 'profile'],
    authService.getProfile,
    {
      enabled: !!user,
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(authService.updateProfile, {
    onSuccess: () => {
      refetchProfile();
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation(authService.changePassword);

  // Get user stats
  const { data: userStats } = useQuery(['user', 'stats'], authService.getUserStats, {
    enabled: !!user,
  });

  return {
    user,
    profile,
    userStats,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout,
    updateProfile: updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    isRegisterLoading: registerMutation.isLoading,
    isLoginLoading: loginMutation.isLoading,
    isUpdateProfileLoading: updateProfileMutation.isLoading,
    isChangePasswordLoading: changePasswordMutation.isLoading,
    registerError: registerMutation.error,
    loginError: loginMutation.error,
    updateProfileError: updateProfileMutation.error,
    changePasswordError: changePasswordMutation.error,
  };
};
