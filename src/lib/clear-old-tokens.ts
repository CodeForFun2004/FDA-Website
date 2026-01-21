// src/lib/clear-old-tokens.ts
/**
 * Utility to clear old/invalid tokens from localStorage
 * Run this once to clean up existing storage
 */

import { useAuthStore } from '@/features/authenticate/store/auth-store';

/**
 * Clear all auth-related data from localStorage
 * Use this to fix issues with old/corrupted tokens
 */
export function clearAllAuthData(): void {
  if (typeof window === 'undefined') {
    console.warn('Cannot clear auth data on server side');
    return;
  }

  try {
    // Clear zustand persisted state
    localStorage.removeItem('fda_auth');

    // Clear any other auth-related keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.includes('auth') ||
          key.includes('token') ||
          key.includes('session'))
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Also clear from zustand store
    useAuthStore.getState().logout();

    console.log('✅ [Clear Tokens] All auth data cleared successfully');
    console.log('Removed keys:', ['fda_auth', ...keysToRemove]);

    return;
  } catch (error) {
    console.error('❌ [Clear Tokens] Error clearing auth data:', error);
  }
}

/**
 * Validate and clean expired tokens from localStorage
 * Keeps valid tokens, removes expired ones
 */
export function cleanExpiredTokens(): void {
  if (typeof window === 'undefined') {
    console.warn('Cannot clean tokens on server side');
    return;
  }

  try {
    const authData = localStorage.getItem('fda_auth');

    if (!authData) {
      console.log('[Clean Tokens] No auth data found in localStorage');
      return;
    }

    const parsed = JSON.parse(authData);
    const expiresAt = parsed.state?.expiresAt;

    if (!expiresAt) {
      console.warn('[Clean Tokens] No expiration date found, clearing data...');
      clearAllAuthData();
      return;
    }

    const expiry = new Date(expiresAt).getTime();
    const now = Date.now();

    if (now >= expiry) {
      console.warn('[Clean Tokens] Token is expired, clearing...');
      clearAllAuthData();
      return;
    }

    console.log('✅ [Clean Tokens] Token is still valid');
    console.log(
      'Expires in:',
      Math.floor((expiry - now) / 1000 / 60),
      'minutes'
    );
  } catch (error) {
    console.error('❌ [Clean Tokens] Error validating tokens:', error);
    console.log('Clearing all auth data due to parsing error...');
    clearAllAuthData();
  }
}

/**
 * Debug localStorage auth data
 */
export function debugLocalStorageAuth(): void {
  if (typeof window === 'undefined') {
    console.warn('Cannot debug localStorage on server side');
    return;
  }

  console.group('🔍 [Debug] localStorage Auth Data');

  try {
    const authData = localStorage.getItem('fda_auth');

    if (!authData) {
      console.log('No auth data in localStorage');
      console.groupEnd();
      return;
    }

    const parsed = JSON.parse(authData);
    const state = parsed.state || {};

    console.log('Status:', state.status);
    console.log('User:', state.user?.email || 'None');
    console.log('Has Access Token:', !!state.accessToken);
    console.log('Access Token Length:', state.accessToken?.length || 0);
    console.log('Has Refresh Token:', !!state.refreshToken);
    console.log('Refresh Token Length:', state.refreshToken?.length || 0);
    console.log('Expires At:', state.expiresAt);

    if (state.expiresAt) {
      const expiry = new Date(state.expiresAt).getTime();
      const now = Date.now();
      const isExpired = now >= expiry;
      const minutesRemaining = Math.floor((expiry - now) / 1000 / 60);

      console.log('Is Expired:', isExpired);
      console.log('Minutes Remaining:', minutesRemaining);
    }

    console.log('Full Data:', parsed);
  } catch (error) {
    console.error('Error parsing localStorage data:', error);
  }

  console.groupEnd();
}

// Export a function to run all cleanup operations
export function runAuthCleanup(): void {
  console.log('🧹 [Auth Cleanup] Starting cleanup process...');
  debugLocalStorageAuth();
  cleanExpiredTokens();
  console.log('✅ [Auth Cleanup] Cleanup complete');
}
