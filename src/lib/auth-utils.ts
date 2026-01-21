// src/lib/auth-utils.ts
/**
 * Global authentication utilities
 * Centralized token management for all features
 */

import { useAuthStore } from '@/features/authenticate/store/auth-store';

/**
 * Get access token with automatic refresh if expired
 * Use this in all features instead of directly accessing store
 *
 * NOTE: This is now a thin wrapper around store.getValidToken()
 * The actual logic lives in the auth store - following React/Zustand best practices!
 */
export async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    console.log('🔒 [Auth] Running on server, no token available');
    return null;
  }

  try {
    // ✅ Delegate to store's getValidToken method
    // All logic is now centralized in the auth store!
    return await useAuthStore.getState().getValidToken();
  } catch (error) {
    console.error('❌ [Auth] Error getting access token:', error);
    return null;
  }
}

/**
 * Synchronous version - gets token without checking expiration
 * Use only when you can't use async (e.g., in React Query setup)
 * WARNING: This may return an expired token!
 */
export function getAccessTokenSync(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const store = useAuthStore.getState();
    return store.accessToken;
  } catch (error) {
    console.error('❌ [Auth] Error getting access token sync:', error);
    return null;
  }
}

/**
 * Force refresh token
 * Useful when you want to manually refresh before a critical operation
 */
export async function forceRefreshToken(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const { refreshSession } = useAuthStore.getState();
    return await refreshSession();
  } catch (error) {
    console.error('❌ [Auth] Error forcing token refresh:', error);
    return false;
  }
}

/**
 * Check if user is authenticated with valid token
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const { accessToken, isTokenExpired } = useAuthStore.getState();
  return !!accessToken && !isTokenExpired();
}

/**
 * Clear auth data and logout
 * Also clears localStorage
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Clear zustand store
    useAuthStore.getState().logout();

    // Clear localStorage manually to ensure old tokens are removed
    localStorage.removeItem('fda_auth');

    console.log('✅ [Auth] Auth data cleared');
  } catch (error) {
    console.error('❌ [Auth] Error clearing auth:', error);
  }
}

/**
 * Get user info from store
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  return useAuthStore.getState().user;
}

/**
 * Check if user has specific role
 */
export function hasRole(role: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return useAuthStore.getState().hasRole(role as any);
}

/**
 * Check if user is admin-like (ADMIN or SUPER_ADMIN)
 */
export function isAdminUser(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return useAuthStore.getState().isAdminLike();
}

/**
 * Debug: Log current auth state
 */
export function debugAuthState(): void {
  if (typeof window === 'undefined') {
    console.log('🔒 [Auth Debug] Running on server');
    return;
  }

  const state = useAuthStore.getState();
  console.group('🔍 [Auth Debug] Current State');
  console.log('Status:', state.status);
  console.log('User:', state.user?.email || 'None');
  console.log('Has Access Token:', !!state.accessToken);
  console.log('Has Refresh Token:', !!state.refreshToken);
  console.log('Token Expired:', state.isTokenExpired());
  console.log('Token Expiring Soon:', state.isTokenExpiringSoon(5));
  console.log('Expires At:', state.expiresAt);
  console.groupEnd();
}
