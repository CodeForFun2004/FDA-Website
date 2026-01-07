// src/lib/api/client.ts
import { useAuthStore } from '@/features/authenticate/store/auth-store';

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL; // https://fda.id.vn/api/v1

type ApiOptions = RequestInit & { auth?: boolean; skipRefresh?: boolean };

function isFormData(body: any): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempt to refresh the access token using the stored refresh token
 * Returns true if refresh was successful, false otherwise
 */
async function tryRefreshToken(): Promise<boolean> {
  // If already refreshing, wait for the existing refresh to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const { refreshToken, logout } = useAuthStore.getState();

  if (!refreshToken) {
    console.warn('[API Client] No refresh token available');
    return false;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      console.log('[API Client] Attempting to refresh token...');

      const res = await fetch(`${BASE}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store'
      });

      if (!res.ok) {
        console.warn('[API Client] Refresh token request failed:', res.status);
        logout();
        return false;
      }

      const data = await res.json();

      if (!data.success) {
        console.warn('[API Client] Refresh token failed:', data.message);
        logout();
        return false;
      }

      // Update tokens in auth store
      useAuthStore.setState({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt
      });

      console.log('[API Client] Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('[API Client] Error refreshing token:', error);
      logout();
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Main API fetch function with automatic token refresh
 */
export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  if (!BASE) throw new Error('Missing NEXT_PUBLIC_API_BASE_URL');

  const url = `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  const needAuth = options.auth !== false;
  const token = needAuth ? useAuthStore.getState().accessToken : null;

  // Build headers safely
  const headers = new Headers(options.headers ?? {});

  // ✅ Only set JSON content-type when body is NOT FormData AND caller hasn't set it
  if (!isFormData(options.body)) {
    if (!headers.has('Content-Type'))
      headers.set('Content-Type', 'application/json');
  } else {
    // ✅ Let browser set boundary for multipart
    headers.delete('Content-Type');
  }

  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store'
  });

  // Handle 401 Unauthorized - attempt token refresh
  if (res.status === 401 && needAuth && !options.skipRefresh) {
    console.log('[API Client] Received 401, attempting token refresh...');

    const refreshSuccess = await tryRefreshToken();

    if (refreshSuccess) {
      // Retry the original request with new token
      const newToken = useAuthStore.getState().accessToken;
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
      }

      console.log('[API Client] Retrying request with new token...');
      res = await fetch(url, {
        ...options,
        headers,
        cache: 'no-store'
      });
    } else {
      // Refresh failed - redirect to login
      console.warn('[API Client] Token refresh failed, redirecting to login');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  }

  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const msg =
      (typeof data === 'object' &&
        data &&
        'message' in (data as any) &&
        String((data as any).message)) ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}

/**
 * Helper function to manually trigger token refresh
 * Can be used proactively before token expires
 */
export async function refreshAuthToken(): Promise<boolean> {
  return tryRefreshToken();
}
