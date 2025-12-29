import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from './types';

interface AppState {
  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // Auth State
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // UI Defaults
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      theme: 'light',
      setTheme: (theme) => set({ theme }),

      // Auth Defaults
      isAuthenticated: false,
      currentUser: null,
      login: (user) => set({ isAuthenticated: true, currentUser: user }),
      logout: () => set({ isAuthenticated: false, currentUser: null }),
    }),
    {
      name: 'fda-storage',
      partialize: (state) => ({ 
        theme: state.theme, 
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser 
      }), // Persist auth and theme
    }
  )
);