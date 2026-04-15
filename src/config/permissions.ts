// src/config/permissions.ts
export type Role = 'SUPERADMIN' | 'ADMIN' | 'MODERATOR';

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
    allowedRoles: ['SUPERADMIN'],
    requireAuth: true
  },

  // Admin routes (SUPERADMIN and ADMIN can access)
  {
    path: '/admin',
    allowedRoles: ['SUPERADMIN', 'ADMIN'],
    requireAuth: true
  },

  // Moderator routes
  {
    path: '/moderator',
    allowedRoles: ['MODERATOR'],
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
  SUPERADMIN: 3,
  ADMIN: 2,
  MODERATOR: 1
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
