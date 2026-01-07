import { type Role } from "@/features/authenticate/api/auth";

// Re-export Role for use in other admin files
export type { Role };

// ===== Types =====

export type AdminUser = {
    id: string;
    email: string;
    fullName: string | null;
    phoneNumber: string | null;
    avatarUrl: string | null;
    roles: Role[];
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
};

export type GetUsersResponse = {
    success: boolean;
    message: string;
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
};

export type GetUserByIdResponse = {
    success: boolean;
    message: string;
    user: AdminUser;
};

export type CreateUserRequest = {
    email: string;
    fullName: string;
    phoneNumber?: string;
    password: string;
    roles: Role[];
};

export type UpdateUserRequest = {
    fullName?: string;
    phoneNumber?: string;
    roles?: Role[];
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
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