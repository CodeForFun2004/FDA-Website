import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { loginApi, type AuthUser, type Role } from "@/lib/api/auth";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;

  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;

  error: string | null;

  loginWithPassword: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;

  // helpers cho role
  hasRole: (role: Role) => boolean;
  isAdminLike: () => boolean; // ADMIN or SUPER_ADMIN
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      status: "idle",
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      error: null,

      loginWithPassword: async (email, password) => {
        set({ status: "loading", error: null });

        try {
          const res = await loginApi({ email, password });

          if (!res.success) {
            set({ status: "unauthenticated", error: res.message || "Login failed" });
            return;
          }

          set({
            status: "authenticated",
            user: res.user,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            expiresAt: res.expiresAt,
            error: null,
          });
        } catch (e: any) {
          set({
            status: "unauthenticated",
            user: null,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            error: e?.message ?? "Login failed",
          });
          throw e;
        }
      },

      logout: () => {
        set({
          status: "unauthenticated",
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      hasRole: (role) => (get().user?.roles ?? []).includes(role),
      isAdminLike: () => {
        const roles = get().user?.roles ?? [];
        return roles.includes("ADMIN") || roles.includes("SUPER_ADMIN");
      },
    }),
    {
      name: "fda_auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        status: s.status,
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        expiresAt: s.expiresAt,
      }),
    }
  )
);
