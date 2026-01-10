import { type Role } from '@/features/authenticate/api/auth';

// Re-export Role for use in other admin files
export type { Role };

// ===== Types =====

/**
 * AdminUser type matching backend API response
 * Endpoint: GET /api/v1/admin/users
 */
export type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  provider: string | null;
  isAdminCreated: boolean;
  status: string;
  lastLoginAt: string | null;
  phoneVerifiedAt: string | null;
  emailVerifiedAt: string | null;
  roles: string[];
  createdAt: string;
  updatedAt: string;
};

/**
 * GET /api/v1/admin/users response
 */
export type GetUsersResponse = {
  success: boolean;
  message: string;
  users: AdminUser[];
  totalCount: number;
};

export type GetUserByIdResponse = {
  success: boolean;
  message: string;
  user: AdminUser;
};

/**
 * POST /api/v1/admin/users - Create user request body
 */
export type CreateUserRequest = {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  roleNames: string[];
};

/**
 * POST /api/v1/admin/users response
 */
export type CreateUserResponse = {
  success: boolean;
  message: string;
  userId: string;
};

/**
 * PATCH /api/v1/admin/users/{userId} - Update user request body
 */
export type UpdateUserRequest = {
  fullName?: string;
  phoneNumber?: string;
  status?: string;
  roleNames?: string[];
};

export type UpdateUserResponse = {
  success: boolean;
  message: string;
  user: AdminUser;
};

export type DeleteUserResponse = {
  success: boolean;
  message: string;
};

// Statistics for admin dashboard
export type AdminStats = {
  totalUsers: number;
  activeUsers: number;
  totalDevices: number;
  activeDevices: number;
  totalAlerts: number;
  pendingAlerts: number;
  totalZones: number;
};

export type GetAdminStatsResponse = {
  success: boolean;
  message: string;
  stats: AdminStats;
};
