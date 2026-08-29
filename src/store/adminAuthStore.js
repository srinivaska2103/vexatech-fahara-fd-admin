import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';

export const useAdminAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,

      setUser: (userData) => {
        if (!userData) return;
        const role = (userData.role || userData.roles?.name || '').toUpperCase();
        if (role !== 'ADMIN') {
          get().logout();
          throw new Error('Unauthorized access. Admin privileges required.');
        }
        const formattedUser = { ...userData, role: 'ADMIN' };
        set({ user: formattedUser, isAuthenticated: true, isInitialized: true });
      },

      setInitialized: (status) => set({ isInitialized: status }),

      logout: () => {
        Cookies.remove('adminAccessToken', { path: '/' });
        Cookies.remove('adminRefreshToken', { path: '/' });
        set({ user: null, isAuthenticated: false, isInitialized: true });
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      }
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
