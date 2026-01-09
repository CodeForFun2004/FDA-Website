// src/features/admin/store/admin-store.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  getAdminUsersApi,
  getAdminUserByIdApi,
  createAdminUserApi,
  updateAdminUserApi,
  deleteAdminUserApi,
  updateUserRolesApi,
  updateUserStatusApi,
  getAdminStatsApi
} from '../api/admin';
import type {
  AdminUser,
  CreateUserRequest,
  UpdateUserRequest,
  AdminStats
} from '../types/admin.type';
import type { Role } from '@/features/authenticate/api/auth';

type AdminStatus = 'idle' | 'loading' | 'success' | 'error';

type AdminState = {
  // State
  status: AdminStatus;
  users: AdminUser[];
  selectedUser: AdminUser | null;
  stats: AdminStats | null;
  error: string | null;

  // Pagination
  total: number;
  page: number;
  limit: number;

  // Actions - Users
  fetchUsers: (params?: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    role?: string;
    status?: string;
  }) => Promise<void>;
  fetchUserById: (userId: string) => Promise<void>;
  createUser: (payload: CreateUserRequest) => Promise<boolean>;
  updateUser: (userId: string, payload: UpdateUserRequest) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  updateUserRoles: (userId: string, roles: string[]) => Promise<boolean>;
  updateUserStatus: (
    userId: string,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  ) => Promise<boolean>;

  // Actions - Stats
  fetchStats: () => Promise<void>;

  // Actions - Utility
  clearSelectedUser: () => void;
  clearError: () => void;
  reset: () => void;

  // Selectors
  getUserById: (userId: string) => AdminUser | undefined;
  getActiveUsers: () => AdminUser[];
  getUsersByRole: (role: Role) => AdminUser[];
};

const initialState = {
  status: 'idle' as AdminStatus,
  users: [] as AdminUser[],
  selectedUser: null as AdminUser | null,
  stats: null as AdminStats | null,
  error: null as string | null,
  total: 0,
  page: 1,
  limit: 10
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ===== Users Actions =====

      /**
       * Fetch all users with pagination and filters
       */
      fetchUsers: async (params) => {
        set({ status: 'loading', error: null });

        try {
          const res = await getAdminUsersApi({
            pageNumber: params?.pageNumber ?? 1,
            pageSize: params?.pageSize ?? 10,
            searchTerm: params?.searchTerm,
            role: params?.role,
            status: params?.status
          });

          if (!res.success) {
            set({
              status: 'error',
              error: res.message || 'Failed to fetch users'
            });
            return;
          }

          set({
            status: 'success',
            users: res.users,
            total: res.totalCount,
            page: params?.pageNumber ?? 1,
            limit: params?.pageSize ?? 10,
            error: null
          });
        } catch (e: any) {
          set({
            status: 'error',
            users: [],
            error: e?.message ?? 'Failed to fetch users'
          });
          throw e;
        }
      },

      /**
       * Fetch single user by ID
       */
      fetchUserById: async (userId: string) => {
        set({ status: 'loading', error: null });

        try {
          const res = await getAdminUserByIdApi(userId);

          if (!res.success) {
            set({
              status: 'error',
              error: res.message || 'Failed to fetch user'
            });
            return;
          }

          set({
            status: 'success',
            selectedUser: res.user,
            error: null
          });
        } catch (e: any) {
          set({
            status: 'error',
            selectedUser: null,
            error: e?.message ?? 'Failed to fetch user'
          });
          throw e;
        }
      },

      /**
       * Create new user
       * @returns true nếu thành công
       */
      createUser: async (payload: CreateUserRequest) => {
        set({ status: 'loading', error: null });

        try {
          const res = await createAdminUserApi(payload);

          if (!res.success) {
            set({
              status: 'error',
              error: res.message || 'Failed to create user'
            });
            return false;
          }

          // Refetch users list since we only get userId back
          set({
            status: 'success',
            total: get().total + 1,
            error: null
          });
          return true;
        } catch (e: any) {
          set({
            status: 'error',
            error: e?.message ?? 'Failed to create user'
          });
          return false;
        }
      },

      /**
       * Update existing user
       * @returns true nếu thành công
       */
      updateUser: async (userId: string, payload: UpdateUserRequest) => {
        set({ status: 'loading', error: null });

        try {
          const res = await updateAdminUserApi(userId, payload);

          if (!res.success) {
            set({
              status: 'error',
              error: res.message || 'Failed to update user'
            });
            return false;
          }

          // Update user in list
          set((state) => ({
            status: 'success',
            users: state.users.map((u) => (u.id === userId ? res.user : u)),
            selectedUser:
              state.selectedUser?.id === userId ? res.user : state.selectedUser,
            error: null
          }));
          return true;
        } catch (e: any) {
          set({
            status: 'error',
            error: e?.message ?? 'Failed to update user'
          });
          return false;
        }
      },

      /**
       * Delete user
       * @returns true nếu thành công
       */
      deleteUser: async (userId: string) => {
        set({ status: 'loading', error: null });

        try {
          const res = await deleteAdminUserApi(userId);

          if (!res.success) {
            set({
              status: 'error',
              error: res.message || 'Failed to delete user'
            });
            return false;
          }

          // Remove user from list
          set((state) => ({
            status: 'success',
            users: state.users.filter((u) => u.id !== userId),
            total: state.total - 1,
            selectedUser:
              state.selectedUser?.id === userId ? null : state.selectedUser,
            error: null
          }));
          return true;
        } catch (e: any) {
          set({
            status: 'error',
            error: e?.message ?? 'Failed to delete user'
          });
          return false;
        }
      },

      /**
       * Update user roles
       * @returns true nếu thành công
       */
      updateUserRoles: async (userId: string, roles: string[]) => {
        set({ status: 'loading', error: null });

        try {
          const res = await updateUserRolesApi(userId, roles);

          if (!res.success) {
            set({
              status: 'error',
              error: res.message || 'Failed to update roles'
            });
            return false;
          }

          // Update user in list
          set((state) => ({
            status: 'success',
            users: state.users.map((u) => (u.id === userId ? res.user : u)),
            selectedUser:
              state.selectedUser?.id === userId ? res.user : state.selectedUser,
            error: null
          }));
          return true;
        } catch (e: any) {
          set({
            status: 'error',
            error: e?.message ?? 'Failed to update roles'
          });
          return false;
        }
      },

      /**
       * Update user status (activate/deactivate/suspend)
       * @returns true nếu thành công
       */
      updateUserStatus: async (
        userId: string,
        status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
      ) => {
        set({ status: 'loading', error: null });

        try {
          const res = await updateUserStatusApi(userId, status);

          if (!res.success) {
            set({
              status: 'error',
              error: res.message || 'Failed to update status'
            });
            return false;
          }

          // Update user in list
          set((state) => ({
            status: 'success',
            users: state.users.map((u) => (u.id === userId ? res.user : u)),
            selectedUser:
              state.selectedUser?.id === userId ? res.user : state.selectedUser,
            error: null
          }));
          return true;
        } catch (e: any) {
          set({
            status: 'error',
            error: e?.message ?? 'Failed to update status'
          });
          return false;
        }
      },

      // ===== Stats Actions =====

      /**
       * Fetch admin dashboard stats
       */
      fetchStats: async () => {
        set({ status: 'loading', error: null });

        try {
          const res = await getAdminStatsApi();

          if (!res.success) {
            set({
              status: 'error',
              error: res.message || 'Failed to fetch stats'
            });
            return;
          }

          set({
            status: 'success',
            stats: res.stats,
            error: null
          });
        } catch (e: any) {
          set({
            status: 'error',
            stats: null,
            error: e?.message ?? 'Failed to fetch stats'
          });
          throw e;
        }
      },

      // ===== Utility Actions =====

      clearSelectedUser: () => set({ selectedUser: null }),
      clearError: () => set({ error: null }),
      reset: () => set(initialState),

      // ===== Selectors =====

      getUserById: (userId: string) => get().users.find((u) => u.id === userId),
      getActiveUsers: () => get().users.filter((u) => u.status === 'ACTIVE'),
      getUsersByRole: (role: Role) =>
        get().users.filter((u) => u.roles.includes(role))
    }),
    {
      name: 'fda_admin',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        // Chỉ persist những data cần thiết
        stats: s.stats
      })
    }
  )
);

// ===== Utility Hooks =====

/**
 * Hook kiểm tra quyền admin
 * Sử dụng kết hợp với useAuthStore
 */
export function useAdminPermissions() {
  const { users, stats } = useAdminStore();

  return {
    canManageUsers: true, // Will be checked by auth middleware
    canDeleteUsers: true, // Only SUPER_ADMIN
    canChangeRoles: true, // Only SUPER_ADMIN
    totalUsers: stats?.totalUsers ?? users.length
  };
}
