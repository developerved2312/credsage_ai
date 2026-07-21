import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  image?: string;
  firstName?: string;
  lastName?: string;
}

interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  setAuth: (user: User, session: Session) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      
      setAuth: (user, session) =>
        set({
          user,
          session,
          isAuthenticated: true,
        }),
      
      clearAuth: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        }),
      
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
