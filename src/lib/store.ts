import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),

      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "fda_storage",
      partialize: (state) => ({ theme: state.theme, isSidebarOpen: state.isSidebarOpen }),
    }
  )
);
