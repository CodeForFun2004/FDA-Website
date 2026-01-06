// src/features/authenticate/types/auth.type.ts
// ===== Core Types =====

export type Role = "ADMIN" | "SUPER_ADMIN" | "AUTHORITY";

export type AuthUser = {
    id: string;
    email: string;
    fullName: string | null;
    phoneNumber: string | null;
    avatarUrl: string | null;
    roles: Role[];
};

// ===== Check Identifier =====

export type CheckIdentifierRequest = {
    identifier: string; // email or phone
};

export type CheckIdentifierResponse = {
    success: boolean;
    message: string;
    identifierType?: string; // e.g. "email" | "phone"
    accountExists?: boolean;
    hasPassword?: boolean;
    requiredMethod?: string; // e.g. "OTP" | "PASSWORD"
};

// ===== Send OTP =====

export type SendOtpRequest = {
    identifier: string; // email or phone
};

export type SendOtpResponse = {
    success: boolean;
    message: string;
    otpCode?: string; // dev only in swagger (prod thường không trả)
    expiresAt?: string; // ISO
    identifierType?: string | null;
};

// ===== Login =====

export type LoginRequest = {
    identifier: string;
    otpCode: string | null;
    password: string | null;
    deviceInfo?: any | null;
};

export type LoginResponse = {
    success: boolean;
    message: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: string; // ISO
    user: AuthUser;
};

// ===== Google OAuth =====

export type GoogleInitResponse = {
    success: boolean;
    message?: string;
    authorizationUrl: string;
    state: string;
};

export type GoogleCallbackResponse = {
    success: boolean;
    message?: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    user: AuthUser; // backend trả user giống login thường
};
