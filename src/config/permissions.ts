// src/config/permissions.ts
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'AUTHORITY';

export type RoutePermissions = {
  path: string;
  allowedRoles: Role[];
  requireAuth: boolean;
};

// ===== Permission Matrix - Single Source of Truth =====
export const ROUTE_PERMISSIONS: RoutePermissions[] = [
  // Super Admin exclusive routes
  {
    path: '/superadmin',
    allowedRoles: ['SUPER_ADMIN'],
    requireAuth: true
  },

  // Admin routes (SUPER_ADMIN and ADMIN can access)
  {
    path: '/admin',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
    requireAuth: true
  },

  // Authority routes
  {
    path: '/authority',
    allowedRoles: ['SUPER_ADMIN', 'AUTHORITY'], // SUPER_ADMIN can access everything
    requireAuth: true
  },

  // Public routes (auth pages)
  {
    path: '/auth',
    allowedRoles: [],
    requireAuth: false
  }
];

// ===== Role Hierarchy (for future use) =====
export const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  AUTHORITY: 1
};

// ===== Helper Functions =====

/**
 * Find the most specific matching route config for a given pathname
 */
export function findMatchingRoute(pathname: string): RoutePermissions | null {
  // Filter routes that match the pathname
  const matches = ROUTE_PERMISSIONS.filter((route) =>
    pathname.startsWith(route.path)
  );

  if (matches.length === 0) return null;

  // Return the longest match (most specific)
  return matches.reduce((longest, current) =>
    current.path.length > longest.path.length ? current : longest
  );
}

/**
 * Check if user has permission to access a route
 */
export function hasPermission(
  userRoles: Role[],
  allowedRoles: Role[]
): boolean {
  // If no roles required (public route), allow
  if (allowedRoles.length === 0) return true;

  // Check if user has at least one of the allowed roles
  return userRoles.some((role) => allowedRoles.includes(role));
}

/**
 * Get highest role from user's roles
 */
export function getHighestRole(roles: Role[]): Role | null {
  if (!roles || roles.length === 0) return null;

  return roles.reduce((highest, current) =>
    ROLE_HIERARCHY[current] > ROLE_HIERARCHY[highest] ? current : highest
  );
}
