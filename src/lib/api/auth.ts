import { apiFetch } from "./client";

export type Role = "ADMIN" | "SUPER_ADMIN" | "AUTHORITY";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  roles: Role[];
};

/**
 * ===== New Auth Flow =====
 * 1) POST /auth/check-identifier  { identifier }
 * 2) POST /auth/send-otp         { identifier }
 * 3) POST /auth/login            { identifier, otpCode?, password?, deviceInfo? }
 */

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

export function checkIdentifierApi(payload: CheckIdentifierRequest) {
  return apiFetch<CheckIdentifierResponse>("/auth/check-identifier", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export type SendOtpRequest = {
  identifier: string; // email or phone
};

export type SendOtpResponse = {
  success: boolean;
  message: string;

  // dev only in swagger (prod thường không trả)
  otpCode?: string;

  expiresAt?: string; // ISO
  identifierType?: string | null;
};

export function sendOtpApi(payload: SendOtpRequest) {
  return apiFetch<SendOtpResponse>("/auth/send-otp", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

// ✅ login dùng identifier + (otpCode | password)
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

export function loginApi(payload: LoginRequest) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

/**
 * ===== Google OAuth =====
 * dùng apiFetch cho đồng bộ baseURL + error handling
 *
 * GET /auth/google?returnUrl=...
 * GET /auth/google/callback?code=...&state=...
 */

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
  user: AuthUser;
};

export function initGoogleOAuthApi(params: { returnUrl: string }) {
  const qs = new URLSearchParams({ returnUrl: params.returnUrl }).toString();

  // giả định apiFetch tự ghép baseURL + prefix /api/v1
  return apiFetch<GoogleInitResponse>(`/auth/google?${qs}`, {
    method: "GET",
    auth: false,
  });
}

export function googleCallbackApi(params: { code: string; state: string }) {
  const qs = new URLSearchParams({
    code: params.code,
    state: params.state,
  }).toString();

  return apiFetch<GoogleCallbackResponse>(`/auth/google/callback?${qs}`, {
    method: "GET",
    auth: false,
  });
}
