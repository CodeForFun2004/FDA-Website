// src/features/stations/utils/auth.ts

import { useAuthStore } from '@/features/authenticate/store/auth-store';

/**
 * Get access token from auth store
 * Checks if token is expired and attempts to refresh if needed
 */
export async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    console.log('🔒 Auth: Running on server, no token available');
    return null;
  }

  try {
    const store = useAuthStore.getState();
    const { accessToken, isTokenExpired, refreshSession } = store;

    console.log('🔍 Auth: Checking token status');
    console.log('✅ Auth: Token exists:', !!accessToken);
    console.log('📏 Auth: Token length:', accessToken?.length);

    if (!accessToken) {
      console.warn('⚠️ Auth: No access token found');
      return null;
    }

    // Check if token is expired
    if (isTokenExpired()) {
      console.warn('⏰ Auth: Token is expired, attempting refresh...');
      const refreshed = await refreshSession();

      if (refreshed) {
        const newToken = useAuthStore.getState().accessToken;
        console.log('✅ Auth: Token refreshed successfully');
        return newToken;
      } else {
        console.error('❌ Auth: Token refresh failed');
        return null;
      }
    }

    console.log('✅ Auth: Token is valid');
    return accessToken;
  } catch (error) {
    console.error('❌ Auth: Error getting access token', error);
    return null;
  }
}

/**
 * Synchronous version - gets token without checking expiration
 * Use only when you can't use async (e.g., in React Query mutations)
 */
export function getAccessTokenSync(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const store = useAuthStore.getState();
    return store.accessToken;
  } catch (error) {
    console.error('❌ Auth: Error getting access token sync', error);
    return null;
  }
}
