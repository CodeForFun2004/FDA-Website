// src/features/stations/utils/auth.ts
/**
 * @deprecated Use global auth utils from @/lib/auth-utils instead
 * This file is kept for backward compatibility but will be removed
 */

import {
  getAccessToken as getAccessTokenGlobal,
  getAccessTokenSync as getAccessTokenSyncGlobal,
  debugAuthState
} from '@/lib/auth-utils';

/**
 * Get access token from auth store
 * Checks if token is expired and attempts to refresh if needed
 * @deprecated Use getAccessToken from @/lib/auth-utils instead
 */
export async function getAccessToken(): Promise<string | null> {
  return getAccessTokenGlobal();
}

/**
 * Synchronous version - gets token without checking expiration
 * Use only when you can't use async (e.g., in React Query mutations)
 * @deprecated Use getAccessTokenSync from @/lib/auth-utils instead
 */
export function getAccessTokenSync(): string | null {
  return getAccessTokenSyncGlobal();
}

// Re-export debug function
export { debugAuthState };
