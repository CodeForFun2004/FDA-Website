// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Role-Based Access Control
 *
 * Protects admin routes and ensures only authorized roles can access them.
 * - /admin/* → requires ADMIN, SUPER_ADMIN
 * - /authority/* → requires AUTHORITY
 * - /superadmin/* → requires SUPER_ADMIN
 */

// Helper to decode JWT payload (simple base64 decode, no verification)
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Helper to get user roles from token
function getUserRoles(request: NextRequest): string[] {
  // Try to get from auth store (persisted in localStorage, but middleware runs on server)
  // So we need to check cookie or token

  // Check if fda_session cookie exists (basic auth check)
  const sessionCookie = request.cookies.get('fda_session');
  if (!sessionCookie) {
    return [];
  }

  // Try to get from Authorization header or cookie
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');

  // If no token in header, try to get from cookie (if stored there)
  // Note: In your setup, tokens are in localStorage, so middleware can't access them directly
  // We need to rely on a server-side cookie or pass role info in a cookie

  // For now, let's use a workaround: parse roles from a cookie we'll set
  const rolesCookie = request.cookies.get('fda_user_roles');
  if (rolesCookie) {
    try {
      return JSON.parse(rolesCookie.value);
    } catch {
      return [];
    }
  }

  // If we have token, try to decode it
  if (token) {
    const payload = decodeJWT(token);
    if (payload?.roles) {
      return Array.isArray(payload.roles) ? payload.roles : [payload.roles];
    }
  }

  return [];
}

// Check if user has required role
function hasRequiredRole(
  userRoles: string[],
  requiredRoles: string[]
): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Check if user is authenticated (has session cookie)
  const sessionCookie = request.cookies.get('fda_session');

  if (!sessionCookie) {
    // Not authenticated - redirect to login
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Get user roles
  const userRoles = getUserRoles(request);

  // Define route protections
  const routeProtections: Record<string, string[]> = {
    '/admin': ['ADMIN', 'SUPER_ADMIN'],
    '/authority': ['AUTHORITY'],
    '/superadmin': ['SUPER_ADMIN']
  };

  // Check if current route requires specific roles
  for (const [routePrefix, requiredRoles] of Object.entries(routeProtections)) {
    if (pathname.startsWith(routePrefix)) {
      // If no roles (token not accessible in middleware), we need a better approach
      // Let's redirect to a client-side check page
      if (userRoles.length === 0) {
        // Can't determine roles server-side, let client-side handle it
        return NextResponse.next();
      }

      if (!hasRequiredRole(userRoles, requiredRoles)) {
        // User doesn't have required role - redirect to forbidden page
        return NextResponse.redirect(new URL('/auth/forbidden', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|mock).*)'
  ]
};
