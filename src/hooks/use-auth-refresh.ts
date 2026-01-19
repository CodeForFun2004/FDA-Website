// src/hooks/use-auth-refresh.ts
'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/features/authenticate/store/auth-store';

/**
 * Hook to automatically refresh token before expiration
 * Use this in layout or main app component
 */
export function useAuthRefresh() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { status, isTokenExpiringSoon, refreshSession } = useAuthStore();

  useEffect(() => {
    // Only run if user is authenticated
    if (status !== 'authenticated') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Check token every 1 minute
    const checkAndRefresh = async () => {
      try {
        // Check if token is expiring in next 10 minutes
        if (isTokenExpiringSoon(10)) {
          console.log('[Auth Refresh] Token expiring soon, refreshing...');
          const success = await refreshSession();

          if (success) {
            console.log('[Auth Refresh] Token refreshed successfully');
          } else {
            console.error('[Auth Refresh] Token refresh failed');
          }
        }
      } catch (error) {
        console.error('[Auth Refresh] Error during auto-refresh:', error);
      }
    };

    // Run immediately on mount
    checkAndRefresh();

    // Then run every minute
    intervalRef.current = setInterval(checkAndRefresh, 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, isTokenExpiringSoon, refreshSession]);
}

/**
 * Hook to validate token on mount and clear if expired
 * Use this in authenticated layouts
 */
export function useValidateToken() {
  const { isTokenExpired, logout } = useAuthStore();

  useEffect(() => {
    if (isTokenExpired()) {
      console.warn('[Token Validator] Token is expired, logging out...');
      logout();

      // Optionally redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  }, [isTokenExpired, logout]);
}
