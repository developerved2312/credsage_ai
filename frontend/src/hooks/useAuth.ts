import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@lib/auth.client';
import { authService } from '@services/authService';
import { useAuthStore } from '@store/authStore';
import type { User } from '@appTypes/index';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAuth, clearAuth, user: storedUser } = useAuthStore();
  
  // Get session from Better Auth
  const { data: session, isPending: isSessionLoading } = useSession();

  // Sync session with auth store
  React.useEffect(() => {
    if (session?.user && session?.session) {
      setAuth(
        {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name ?? undefined,
          emailVerified: session.user.emailVerified,
          image: session.user.image ?? undefined,
        },
        {
          id: session.session.id,
          userId: session.session.userId,
          expiresAt: new Date(session.session.expiresAt),
        }
      );
    } else if (!isSessionLoading && !session) {
      clearAuth();
    }
  }, [session, isSessionLoading, setAuth, clearAuth]);

  // Register mutation
  const registerMutation = useMutation(authService.register, {
    onSuccess: () => {
      queryClient.invalidateQueries(['session']);
      navigate('/dashboard');
    },
  });

  // Login mutation
  const loginMutation = useMutation(authService.login, {
    onSuccess: () => {
      queryClient.invalidateQueries(['session']);
      navigate('/dashboard');
    },
  });

  // Google login
  const loginWithGoogle = async () => {
    await authService.loginWithGoogle();
  };

  // Logout
  const logout = async () => {
    await authService.logout();
    clearAuth();
    queryClient.clear();
    navigate('/login');
  };

  // Get profile query
  const { data: profile, refetch: refetchProfile } = useQuery<User>(
    ['user', 'profile'],
    authService.getProfile,
    {
      enabled: !!session?.user,
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(authService.updateProfile, {
    onSuccess: () => {
      refetchProfile();
      queryClient.invalidateQueries(['session']);
    },
  });

  // Get user stats
  const { data: userStats } = useQuery(['user', 'stats'], authService.getUserStats, {
    enabled: !!session?.user,
  });

  return {
    user: session?.user ?? storedUser,
    session: session?.session,
    profile,
    userStats,
    isAuthenticated: !!session?.user,
    isLoading: isSessionLoading,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    loginWithGoogle,
    logout,
    updateProfile: updateProfileMutation.mutate,
    isRegisterLoading: registerMutation.isLoading,
    isLoginLoading: loginMutation.isLoading,
    isUpdateProfileLoading: updateProfileMutation.isLoading,
    registerError: registerMutation.error,
    loginError: loginMutation.error,
    updateProfileError: updateProfileMutation.error,
  };
};

// Add React import
import React from 'react';
