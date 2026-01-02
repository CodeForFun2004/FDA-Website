import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { loginApi, type AuthUser, type Role, googleCallbackApi } from "@/lib/api/auth";


type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;

  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;

  error: string | null;

  loginWithPassword: (email: string, password: string) => Promise<void>;
  loginWithGoogleCallback: (code: string, state: string) => Promise<void>;

    setSession: (payload: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  }) => void;


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

            setSession: ({ user, accessToken, refreshToken, expiresAt }) => {
        // normalize avatarUrl null -> undefined nếu cần ở UI khác
        const safeUser: AuthUser = {
          ...user,
          avatarUrl: user.avatarUrl ?? null, // giữ đúng type của bạn là string | null
        };

        set({
          status: "authenticated",
          user: safeUser,
          accessToken,
          refreshToken,
          expiresAt,
          error: null,
        });
      },


            loginWithGoogleCallback: async (code, state) => {
        set({ status: "loading", error: null });

        try {
          const res = await googleCallbackApi({ code, state });

          // normalize avatarUrl để tránh null (bạn từng bị lỗi TS avatarUrl null)
          const safeUser: AuthUser = {
            ...res.user,
            avatarUrl: (res.user as any)?.avatarUrl ?? undefined,
          };

          set({
            status: "authenticated",
            user: safeUser,
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
            error: e?.message ?? "Google login failed",
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


