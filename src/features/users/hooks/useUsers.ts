// src/features/users/hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { getAdminUsersApi } from '@/features/admin/api/admin';
import type { AdminUser } from '@/features/admin/types/admin.type';
import type { User } from '../types';

// ===== Mapper Function =====

/**
 * Map AdminUser from backend to User for frontend display
 * Option A: Keep existing User type structure
 */
function mapAdminUserToUser(adminUser: AdminUser): User {
  return {
    id: adminUser.id,
    name: adminUser.fullName || adminUser.email.split('@')[0], // Fallback to email prefix if no name
    email: adminUser.email,
    role: mapRoleFromBackend(adminUser.roles),
    status: mapStatusFromBackend(adminUser.status),
    createdAt: adminUser.createdAt,
    lastLogin: adminUser.lastLoginAt || adminUser.createdAt
  };
}

/**
 * Map backend roles array to single Role for display
 * Takes the first role or defaults to 'USER'
 */
function mapRoleFromBackend(
  roles: string[]
): 'ADMIN' | 'USER' | 'SUPER_ADMIN' | 'AUTHORITY' {
  if (!roles || roles.length === 0) return 'USER';

  // Map backend role names to frontend Role type
  const roleMap: Record<
    string,
    'ADMIN' | 'USER' | 'SUPER_ADMIN' | 'AUTHORITY'
  > = {
    ADMIN: 'ADMIN',
    Admin: 'ADMIN',
    admin: 'ADMIN',
    USER: 'USER',
    User: 'USER',
    user: 'USER',
    SUPER_ADMIN: 'SUPER_ADMIN',
    SuperAdmin: 'SUPER_ADMIN',
    'Super Admin': 'SUPER_ADMIN',
    AUTHORITY: 'AUTHORITY',
    Authority: 'AUTHORITY',
    authority: 'AUTHORITY'
  };

  return roleMap[roles[0]] || 'USER';
}

/**
 * Map backend status to frontend status
 */
function mapStatusFromBackend(status: string): 'Active' | 'Inactive' {
  const activeStatuses = ['ACTIVE', 'Active', 'active'];
  return activeStatuses.includes(status) ? 'Active' : 'Inactive';
}

// ===== Hooks =====

export type UseUsersParams = {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  role?: string;
  status?: string;
};

export type UseUsersResult = {
  users: User[];
  totalCount: number;
};

/**
 * Hook to fetch users from API with server-side pagination and filtering
 */
export const useUsers = (params: UseUsersParams = {}) => {
  const { pageNumber = 1, pageSize = 10, searchTerm, role, status } = params;

  return useQuery({
    queryKey: ['users', pageNumber, pageSize, searchTerm, role, status],
    queryFn: async (): Promise<UseUsersResult> => {
      const response = await getAdminUsersApi({
        pageNumber,
        pageSize,
        searchTerm: searchTerm || undefined,
        role: role && role !== 'all' ? role : undefined,
        status: status || undefined
      });

      return {
        users: response.users.map(mapAdminUserToUser),
        totalCount: response.totalCount
      };
    }
  });
};
