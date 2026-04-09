// src/features/admin/api/admin.ts
import { apiFetch } from '@/libs/api/client';
import type {
  GetUsersResponse,
  GetUserByIdResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserResponse,
  GetAdminStatsResponse,
  GetAdministrativeAreasResponse,
  GetFloodEventsResponse
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

/**
 * GET /admin/administrative-areas
 * Get list of administrative areas (requires auth)
 */
export function getAdministrativeAreasApi(params?: {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  level?: string;
  parentId?: string;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set('pageNumber', String(params?.pageNumber ?? 1));
  searchParams.set('pageSize', String(params?.pageSize ?? 10));
  if (params?.searchTerm) searchParams.set('searchTerm', params.searchTerm);
  if (params?.level) searchParams.set('level', params.level);
  if (params?.parentId) searchParams.set('parentId', params.parentId);

  return apiFetch<GetAdministrativeAreasResponse>(
    `/admin/administrative-areas?${searchParams.toString()}`,
    { method: 'GET' }
  );
}

/**
 * GET /admin/flood-events
 * List flood events (requires auth)
 *
 * FE-17: support data for Frequency aggregation.
 */
export function getFloodEventsApi(params?: {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  administrativeAreaId?: string;
  startTimeFrom?: string;
  startTimeTo?: string;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set('pageNumber', String(params?.pageNumber ?? 1));
  searchParams.set('pageSize', String(params?.pageSize ?? 10));
  if (params?.searchTerm) searchParams.set('searchTerm', params.searchTerm);
  if (params?.administrativeAreaId)
    searchParams.set('administrativeAreaId', params.administrativeAreaId);
  if (params?.startTimeFrom)
    searchParams.set('startTimeFrom', params.startTimeFrom);
  if (params?.startTimeTo) searchParams.set('startTimeTo', params.startTimeTo);

  return apiFetch<GetFloodEventsResponse>(
    `/admin/flood-events?${searchParams.toString()}`,
    {
      method: 'GET'
    }
  );
}

/**
 * FE-17 (FeatG57-61): Administrative Area CRUD
 */
export function getAdministrativeAreaByIdApi(id: string) {
  return apiFetch(`/admin/administrative-areas/${id}`, { method: 'GET' });
}

export function createAdministrativeAreaApi(payload: unknown) {
  return apiFetch('/admin/administrative-areas', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateAdministrativeAreaApi(id: string, payload: unknown) {
  return apiFetch(`/admin/administrative-areas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteAdministrativeAreaApi(id: string) {
  return apiFetch(`/admin/administrative-areas/${id}`, { method: 'DELETE' });
}

/**
 * FE-17 (FeatG62-66): Flood Event CRUD
 */
export function getFloodEventByIdApi(id: string) {
  return apiFetch(`/admin/flood-events/${id}`, { method: 'GET' });
}

export function createFloodEventApi(payload: unknown) {
  return apiFetch('/admin/flood-events', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateFloodEventApi(id: string, payload: unknown) {
  return apiFetch(`/admin/flood-events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteFloodEventApi(id: string) {
  return apiFetch(`/admin/flood-events/${id}`, { method: 'DELETE' });
}
