// src/features/admin/api/admin.ts
import { apiFetch } from "@/lib/api/client";
import type {
    Role,
    GetUsersResponse,
    GetUserByIdResponse,
    CreateUserRequest,
    UpdateUserRequest,
    UpdateUserResponse,
    DeleteUserResponse,
    GetAdminStatsResponse
} from "../types/admin.type";


// ===== API Functions =====

/**
 * GET /admin/users
 * Lấy danh sách tất cả users (chỉ ADMIN/SUPER_ADMIN)
 */
export function getAdminUsersApi(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    status?: string;
}) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.role) searchParams.set("role", params.role);
    if (params?.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    return apiFetch<GetUsersResponse>(`/admin/users${query ? `?${query}` : ""}`, {
        method: "GET",
    });
}

/**
 * GET /admin/users/:id
 * Lấy thông tin chi tiết user
 */
export function getAdminUserByIdApi(userId: string) {
    return apiFetch<GetUserByIdResponse>(`/admin/users/${userId}`, {
        method: "GET",
    });
}

/**
 * POST /admin/users
 * Tạo user mới (chỉ SUPER_ADMIN)
 */
export function createAdminUserApi(payload: CreateUserRequest) {
    return apiFetch<UpdateUserResponse>("/admin/users", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

/**
 * PUT /admin/users/:id
 * Cập nhật thông tin user
 */
export function updateAdminUserApi(userId: string, payload: UpdateUserRequest) {
    return apiFetch<UpdateUserResponse>(`/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

/**
 * DELETE /admin/users/:id
 * Xóa user (chỉ SUPER_ADMIN)
 */
export function deleteAdminUserApi(userId: string) {
    return apiFetch<DeleteUserResponse>(`/admin/users/${userId}`, {
        method: "DELETE",
    });
}

/**
 * PUT /admin/users/:id/roles
 * Cập nhật roles của user (chỉ SUPER_ADMIN)
 */
export function updateUserRolesApi(userId: string, roles: Role[]) {
    return apiFetch<UpdateUserResponse>(`/admin/users/${userId}/roles`, {
        method: "PUT",
        body: JSON.stringify({ roles }),
    });
}

/**
 * PUT /admin/users/:id/status
 * Cập nhật status của user (activate/deactivate/suspend)
 */
export function updateUserStatusApi(
    userId: string,
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
) {
    return apiFetch<UpdateUserResponse>(`/admin/users/${userId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
    });
}

/**
 * GET /admin/stats
 * Lấy thống kê tổng quan cho admin dashboard
 */
export function getAdminStatsApi() {
    return apiFetch<GetAdminStatsResponse>("/admin/stats", {
        method: "GET",
    });
}
