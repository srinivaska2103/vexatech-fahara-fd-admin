import { create } from 'zustand';
import Cookies from 'js-cookie';

export const useAdminAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setUser: (user) => {
    // Strictly enforce ADMIN role
    if (user?.role !== 'ADMIN') {
      get().logout();
      throw new Error('Unauthorized access. Admin privileges required.');
    }
    set({ user, isAuthenticated: true });
  },

  setInitialized: (status) => set({ isInitialized: status }),

  logout: () => {
    Cookies.remove('adminAccessToken');
    Cookies.remove('adminRefreshToken');
    set({ user: null, isAuthenticated: false });
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }
}));
