// src/features/users/hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { getAdminUsersApi } from '@/features/admin/api/admin.api';
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
    roles: mapRolesFromBackend(adminUser.roles),
    status: mapStatusFromBackend(adminUser.status),
    isAdminCreated: adminUser.isAdminCreated,
    createdAt: adminUser.createdAt,
    lastLogin: adminUser.lastLoginAt || adminUser.createdAt
  };
}

/**
 * Map backend roles array to frontend Role list
 */
function mapRolesFromBackend(
  roles: string[]
): Array<'ADMIN' | 'USER' | 'SUPERADMIN' | 'MODERATOR'> {
  if (!roles || roles.length === 0) return ['USER'];

  // Map backend role names to frontend Role type
  const roleMap: Record<string, 'ADMIN' | 'USER' | 'SUPERADMIN' | 'MODERATOR'> =
    {
      ADMIN: 'ADMIN',
      Admin: 'ADMIN',
      admin: 'ADMIN',
      USER: 'USER',
      User: 'USER',
      user: 'USER',
      // Backward + forward compatible mapping
      SUPERADMIN: 'SUPERADMIN',
      SuperAdmin: 'SUPERADMIN',

      MODERATOR: 'MODERATOR',
      Moderator: 'MODERATOR',
      moderator: 'MODERATOR'
    };

  const normalized = roles.map((role) => roleMap[role]).filter(Boolean);

  return normalized.length > 0 ? normalized : ['USER'];
}

/**
 * Map backend status to frontend status
 */
function mapStatusFromBackend(
  status: string
): 'Active' | 'Inactive' | 'Banned' {
  const activeStatuses = ['ACTIVE', 'Active', 'active'];
  const bannedStatuses = ['banned', 'Banned', 'BANNED'];

  if (activeStatuses.includes(status)) return 'Active';
  if (bannedStatuses.includes(status)) return 'Banned';
  return 'Inactive';
}

// ===== Hooks =====

export type UseUsersParams = {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  role?: string;
  status?: string;
  createdBy?: string;
};

export type UseUsersResult = {
  users: User[];
  totalCount: number;
};

/**
 * Hook to fetch users from API with server-side pagination and filtering
 */
export const useUsers = (params: UseUsersParams = {}) => {
  const {
    pageNumber = 1,
    pageSize = 10,
    searchTerm,
    role,
    status,
    createdBy
  } = params;

  return useQuery({
    queryKey: [
      'users',
      pageNumber,
      pageSize,
      searchTerm,
      role,
      status,
      createdBy
    ],
    queryFn: async (): Promise<UseUsersResult> => {
      const response = await getAdminUsersApi({
        pageNumber,
        pageSize,
        searchTerm: searchTerm || undefined,
        role: role && role !== 'all' ? role : undefined,
        status: status || undefined,
        createdBy: createdBy || undefined
      });

      return {
        users: response.users.map(mapAdminUserToUser),
        totalCount: response.totalCount
      };
    }
  });
};
