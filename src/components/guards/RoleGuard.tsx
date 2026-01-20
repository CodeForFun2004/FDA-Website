// src/components/guards/RoleGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import type { Role } from '@/features/authenticate/types/auth.type';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: Role[];
  fallbackPath?: string;
}

/**
 * Client-side Role Guard Component
 *
 * Protects routes based on user roles.
 * If user doesn't have required role, redirects to forbidden page.
 *
 * Usage:
 * <RoleGuard requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
 *   <AdminContent />
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  requiredRoles,
  fallbackPath = '/auth/forbidden'
}: RoleGuardProps) {
  const router = useRouter();
  const { status, user } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Wait for auth to be loaded
    if (status === 'loading' || status === 'idle') {
      return;
    }

    // Not authenticated
    if (status === 'unauthenticated' || !user) {
      console.warn('[RoleGuard] User not authenticated, redirecting to login');
      router.push('/auth/login');
      return;
    }

    // Check if user has required role
    const userRoles = user.roles || [];
    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      console.warn('[RoleGuard] User does not have required role', {
        userRoles,
        requiredRoles
      });
      router.push(fallbackPath);
      setIsAuthorized(false);
      return;
    }

    // User is authorized
    setIsAuthorized(true);
  }, [status, user, requiredRoles, fallbackPath, router]);

  // Loading state
  if (isAuthorized === null || status === 'loading') {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]' />
          <p className='text-muted-foreground mt-4'>Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Not authorized (will redirect)
  if (!isAuthorized) {
    return null;
  }

  // Authorized
  return <>{children}</>;
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(role: Role): boolean {
  const user = useAuthStore((state) => state.user);
  return user?.roles?.includes(role) ?? false;
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useHasAnyRole(roles: Role[]): boolean {
  const user = useAuthStore((state) => state.user);
  const userRoles = user?.roles || [];
  return roles.some((role) => userRoles.includes(role));
}

/**
 * Hook to check if user is admin (ADMIN or SUPER_ADMIN)
 */
export function useIsAdmin(): boolean {
  return useHasAnyRole(['ADMIN', 'SUPER_ADMIN']);
}
