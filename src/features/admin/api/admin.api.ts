// src/features/admin/api/admin.ts
import { apiFetch } from '@/lib/api/client';
import type {
  GetUsersResponse,
  GetUserByIdResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserResponse,
  GetAdminStatsResponse
} from '../types/admin.type';

// ===== API Functions =====

/**
 * GET /admin/users
 * Lấy danh sách tất cả users (chỉ ADMIN)
 * Params: searchTerm, role, status, pageNumber (required), pageSize (required)
 */
export function getAdminUsersApi(params: {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  role?: string;
  status?: string;
  createdBy?: string;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set('pageNumber', String(params.pageNumber));
  searchParams.set('pageSize', String(params.pageSize));
  if (params.searchTerm) searchParams.set('searchTerm', params.searchTerm);
  if (params.role) searchParams.set('role', params.role);
  if (params.status) searchParams.set('status', params.status);
  if (params.createdBy) searchParams.set('createdBy', params.createdBy);

  const url = `/admin/users?${searchParams.toString()}`;
  console.log('[getAdminUsersApi] Calling URL:', url);
  console.log('[getAdminUsersApi] Params:', params);

  return apiFetch<GetUsersResponse>(url, {
    method: 'GET'
  });
}

/**
 * GET /admin/users/:id
 * Lấy thông tin chi tiết user
 */
export function getAdminUserByIdApi(userId: string) {
  return apiFetch<GetUserByIdResponse>(`/admin/users/${userId}`, {
    method: 'GET'
  });
}

/**
 * POST /admin/users
 * Tạo user mới (chỉ ADMIN)
 */
export function createAdminUserApi(payload: CreateUserRequest) {
  return apiFetch<CreateUserResponse>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * PATCH /admin/users/:id
 * Cập nhật thông tin user (chỉ ADMIN)
 */
export function updateAdminUserApi(userId: string, payload: UpdateUserRequest) {
  return apiFetch<UpdateUserResponse>(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

/**
 * DELETE /admin/users/:id
 * Xóa user (chỉ SUPER_ADMIN)
 */
export function deleteAdminUserApi(userId: string) {
  return apiFetch<DeleteUserResponse>(`/admin/users/${userId}`, {
    method: 'DELETE'
  });
}

/**
 * PUT /admin/users/:id/roles
 * Cập nhật roles của user (chỉ ADMIN)
 */
export function updateUserRolesApi(userId: string, roles: string[]) {
  return apiFetch<UpdateUserResponse>(`/admin/users/${userId}/roles`, {
    method: 'PUT',
    body: JSON.stringify({ roles })
  });
}

/**
 * PUT /admin/users/:id/status
 * Cập nhật status của user (activate/deactivate/suspend)
 */
export function updateUserStatusApi(
  userId: string,
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'banned'
) {
  return apiFetch<UpdateUserResponse>(`/admin/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}

/**
 * GET /admin/stats
 * Lấy thống kê tổng quan cho admin dashboard
 */
export function getAdminStatsApi() {
  return apiFetch<GetAdminStatsResponse>('/admin/stats', {
    method: 'GET'
  });
}
