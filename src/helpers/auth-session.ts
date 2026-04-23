import type { Role } from '@/features/authenticate/types/auth.type';
import { normalizeRoles } from '@/libs/role-utils';

export const SESSION_COOKIE_NAME = 'fda_session';
export const USER_ROLES_COOKIE_NAME = 'fda_user_roles';
export const USER_PORTAL_COOKIE_NAME = 'fda_user_portal';

export type AuthPortal = 'admin' | 'moderator' | 'forbidden';

const SESSION_MAX_AGE_DAYS = 7;

function setCookie(name: string, value: string, days = SESSION_MAX_AGE_DAYS) {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * days;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getPortalFromRoles(input: unknown): AuthPortal {
  const roles = normalizeRoles(input);

  if (roles.includes('ADMIN') || roles.includes('SUPERADMIN')) {
    return 'admin';
  }

  if (roles.includes('MODERATOR')) {
    return 'moderator';
  }

  return 'forbidden';
}

export function getPortalPathFromRoles(input: unknown): string {
  const portal = getPortalFromRoles(input);

  if (portal === 'admin') return '/admin';
  if (portal === 'moderator') return '/moderator';
  return '/auth/forbidden';
}

export function setAuthSessionCookies(
  roles: Role[] | string[] | undefined | null,
  days = SESSION_MAX_AGE_DAYS
) {
  const normalizedRoles = normalizeRoles(roles ?? []);
  setCookie(SESSION_COOKIE_NAME, '1', days);
  setCookie(USER_ROLES_COOKIE_NAME, JSON.stringify(normalizedRoles), days);
  setCookie(USER_PORTAL_COOKIE_NAME, getPortalFromRoles(normalizedRoles), days);
}

export function clearAuthSessionCookies() {
  clearCookie(SESSION_COOKIE_NAME);
  clearCookie(USER_ROLES_COOKIE_NAME);
  clearCookie(USER_PORTAL_COOKIE_NAME);

  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

// Backward-compatible aliases for existing imports.
export function setSessionCookie(days = SESSION_MAX_AGE_DAYS, value = '1') {
  setCookie(SESSION_COOKIE_NAME, value, days);
}

export function clearSessionCookie() {
  clearAuthSessionCookies();
}
