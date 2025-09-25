import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  userId: string | null;
  email: string | null;
  orgId: string | null;
  isAuthenticated: boolean;
  setAuth: (userId: string, email: string, orgId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      userId: null,
      email: null,
      orgId: null,
      isAuthenticated: false,
      setAuth: (userId, email, orgId) => 
        set({ userId, email, orgId, isAuthenticated: true }),
      clearAuth: () => 
        set({ userId: null, email: null, orgId: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        userId: state.userId,
        email: state.email,
        orgId: state.orgId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);