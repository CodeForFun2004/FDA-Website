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
  GetFloodEventsResponse,
  AdministrativeArea
} from '../types/admin.type';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function readNum(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function tryAreaArray(v: unknown): unknown[] | null {
  if (!Array.isArray(v)) return null;
  return v;
}

/**
 * Chuẩn hóa JSON từ GET /admin/administrative-areas (root hoặc bọc data/Data).
 */
export function normalizeAdministrativeAreasResponse(
  raw: unknown
): GetAdministrativeAreasResponse {
  const root = isRecord(raw) ? raw : {};
  const inner = isRecord(root.data)
    ? root.data
    : isRecord(root.Data)
      ? root.Data
      : root;

  const areas =
    tryAreaArray(inner.administrativeAreas) ??
    tryAreaArray(inner.AdministrativeAreas) ??
    tryAreaArray(inner.items) ??
    tryAreaArray(inner.Items) ??
    tryAreaArray(inner.results) ??
    tryAreaArray(inner.Results) ??
    [];

  const totalCount =
    readNum(inner.totalCount) ??
    readNum(inner.TotalCount) ??
    readNum(root.totalCount) ??
    readNum(root.TotalCount) ??
    areas.length;

  return {
    success: Boolean(root.success ?? inner.success ?? true),
    message: String(root.message ?? inner.message ?? ''),
    statusCode: readNum(root.statusCode ?? inner.statusCode) ?? 200,
    administrativeAreas: areas as AdministrativeArea[],
    totalCount
  };
}

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
export async function getAdministrativeAreasApi(params?: {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  level?: string;
  parentId?: string;
}): Promise<GetAdministrativeAreasResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set('pageNumber', String(params?.pageNumber ?? 1));
  searchParams.set('pageSize', String(params?.pageSize ?? 10));
  if (params?.searchTerm) searchParams.set('searchTerm', params.searchTerm);
  if (params?.level) searchParams.set('level', params.level);
  if (params?.parentId) searchParams.set('parentId', params.parentId);

  const raw = await apiFetch<unknown>(
    `/admin/administrative-areas?${searchParams.toString()}`,
    { method: 'GET' }
  );
  return normalizeAdministrativeAreasResponse(raw);
}

const ADMIN_AREAS_COUNT_PAGE_SIZE = 500;

/** Trùng với `fetchAllAdministrativeAreas({ level: 'ward' })` trên Map & Zones. */
export const ADMINISTRATIVE_AREA_MAP_LEVEL = 'ward';

/**
 * Tổng số bản ghi administrative areas — gom pagination để khớp list thực tế
 * (tránh totalCount meta sai hoặc shape JSON lệch).
 * @param options.level — ví dụ `'ward'` để khớp số trên bản đồ (mặc định map chỉ load ward).
 */
export async function getAdministrativeAreasTotalCount(options?: {
  level?: string;
}): Promise<number> {
  const level = options?.level;
  let pageNumber = 1;
  let sum = 0;
  const maxPages = 50;

  while (pageNumber <= maxPages) {
    const res = await getAdministrativeAreasApi({
      pageNumber,
      pageSize: ADMIN_AREAS_COUNT_PAGE_SIZE,
      ...(level ? { level } : {})
    });
    const batch = res.administrativeAreas ?? [];
    sum += batch.length;

    if (batch.length === 0) break;
    if (batch.length < ADMIN_AREAS_COUNT_PAGE_SIZE) break;

    // Khi filter level, totalCount từ BE đôi khi là tổng mọi level → không dùng để dừng sớm.
    const reported = res.totalCount;
    if (
      !level &&
      typeof reported === 'number' &&
      reported > 0 &&
      sum >= reported
    ) {
      break;
    }

    pageNumber += 1;
  }

  return sum;
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
