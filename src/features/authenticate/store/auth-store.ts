// src/stores/auth-store.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  loginApi,
  refreshTokenApi,
  type AuthUser,
  type Role,
  googleCallbackApi
} from '@/features/authenticate/api/auth';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;

  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;

  error: string | null;

  // ✅ NEW flow
  loginWithPassword: (identifier: string, password: string) => Promise<void>;
  loginWithOtp: (identifier: string, otpCode: string) => Promise<void>;

  // Google callback
  loginWithGoogleCallback: (code: string, state: string) => Promise<void>;

  setSession: (payload: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  }) => void;

  // ✅ NEW: Refresh session
  refreshSession: () => Promise<boolean>;

  logout: () => void;
  clearError: () => void;

  hasRole: (role: Role) => boolean;
  isAdminLike: () => boolean;

  // ✅ NEW: Check if token is expired or about to expire
  isTokenExpired: () => boolean;
  isTokenExpiringSoon: (thresholdMinutes?: number) => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      error: null,

      // ✅ Password login: dùng identifier thay vì email
      loginWithPassword: async (identifier, password) => {
        set({ status: 'loading', error: null });

        try {
          const res = await loginApi({
            identifier,
            password,
            otpCode: null,
            deviceInfo: null
          });

          if (!res.success) {
            set({
              status: 'unauthenticated',
              error: res.message || 'Login failed'
            });
            return;
          }

          set({
            status: 'authenticated',
            user: res.user,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            expiresAt: res.expiresAt,
            error: null
          });
        } catch (e: any) {
          set({
            status: 'unauthenticated',
            user: null,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            error: e?.message ?? 'Login failed'
          });
          throw e;
        }
      },

      // ✅ NEW: OTP login
      loginWithOtp: async (identifier, otpCode) => {
        set({ status: 'loading', error: null });

        try {
          const res = await loginApi({
            identifier,
            otpCode,
            password: null,
            deviceInfo: null
          });

          if (!res.success) {
            set({
              status: 'unauthenticated',
              error: res.message || 'Login failed'
            });
            return;
          }

          set({
            status: 'authenticated',
            user: res.user,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            expiresAt: res.expiresAt,
            error: null
          });
        } catch (e: any) {
          set({
            status: 'unauthenticated',
            user: null,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            error: e?.message ?? 'Login failed'
          });
          throw e;
        }
      },

      setSession: ({ user, accessToken, refreshToken, expiresAt }) => {
        const safeUser: AuthUser = {
          ...user,
          avatarUrl: user.avatarUrl ?? null // giữ đúng type string | null
        };

        set({
          status: 'authenticated',
          user: safeUser,
          accessToken,
          refreshToken,
          expiresAt,
          error: null
        });
      },

      loginWithGoogleCallback: async (code, state) => {
        set({ status: 'loading', error: null });

        try {
          const res = await googleCallbackApi({ code, state });

          const safeUser: AuthUser = {
            ...res.user,
            avatarUrl: (res.user as any)?.avatarUrl ?? null
          };

          set({
            status: 'authenticated',
            user: safeUser,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            expiresAt: res.expiresAt,
            error: null
          });
        } catch (e: any) {
          set({
            status: 'unauthenticated',
            user: null,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            error: e?.message ?? 'Google login failed'
          });
          throw e;
        }
      },

      logout: () => {
        set({
          status: 'unauthenticated',
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          error: null
        });
      },

      clearError: () => set({ error: null }),

      hasRole: (role) => (get().user?.roles ?? []).includes(role),
      isAdminLike: () => {
        const roles = get().user?.roles ?? [];
        return roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
      },

      // ✅ NEW: Refresh session using refresh token
      refreshSession: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          console.warn('[Auth Store] No refresh token available');
          return false;
        }

        try {
          const res = await refreshTokenApi({ refreshToken });

          if (!res.success) {
            console.warn('[Auth Store] Refresh failed:', res.message);
            get().logout();
            return false;
          }

          // Update tokens
          set({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            expiresAt: res.expiresAt
          });

          console.log('[Auth Store] Session refreshed successfully');
          return true;
        } catch (error: any) {
          console.error('[Auth Store] Refresh error:', error);
          get().logout();
          return false;
        }
      },

      // ✅ NEW: Check if token is expired
      isTokenExpired: () => {
        const { expiresAt } = get();
        if (!expiresAt) return true;

        const expiry = new Date(expiresAt).getTime();
        return Date.now() >= expiry;
      },

      // ✅ NEW: Check if token is expiring soon (default: 5 minutes)
      isTokenExpiringSoon: (thresholdMinutes = 5) => {
        const { expiresAt } = get();
        if (!expiresAt) return true;

        const expiry = new Date(expiresAt).getTime();
        const threshold = thresholdMinutes * 60 * 1000;
        return Date.now() >= expiry - threshold;
      }
    }),
    {
      name: 'fda_auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        status: s.status,
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        expiresAt: s.expiresAt
      })
    }
  )
);
