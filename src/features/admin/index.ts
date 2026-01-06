// src/features/admin/index.ts
// Re-export all admin feature modules

// Store
export { useAdminStore, useAdminPermissions } from "./store/admin-store";

// API
export {
    getAdminUsersApi,
    getAdminUserByIdApi,
    createAdminUserApi,
    updateAdminUserApi,
    deleteAdminUserApi,
    updateUserRolesApi,
    updateUserStatusApi,
    getAdminStatsApi
} from "./api/admin";

// Types
export * from "./types/admin.type";
