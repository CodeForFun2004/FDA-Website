// src/features/authenticate/api/auth.ts
import { apiFetch } from "@/lib/api/client";
import type {
  CheckIdentifierRequest,
  CheckIdentifierResponse,
  SendOtpRequest,
  SendOtpResponse,
  LoginRequest,
  LoginResponse,
  GoogleInitResponse,
  GoogleCallbackResponse,
  Role,
} from "../types/auth.type";

// Re-export types for backward compatibility
export type {
  Role,
  AuthUser,
  CheckIdentifierRequest,
  CheckIdentifierResponse,
  SendOtpRequest,
  SendOtpResponse,
  LoginRequest,
  LoginResponse,
  GoogleInitResponse,
  GoogleCallbackResponse,
} from "../types/auth.type";

/**
 * ===== Auth API Functions =====
 * 1) POST /auth/check-identifier  { identifier }
 * 2) POST /auth/send-otp         { identifier }
 * 3) POST /auth/login            { identifier, otpCode?, password?, deviceInfo? }
 */

export function checkIdentifierApi(payload: CheckIdentifierRequest) {
  return apiFetch<CheckIdentifierResponse>("/auth/check-identifier", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export function sendOtpApi(payload: SendOtpRequest) {
  return apiFetch<SendOtpResponse>("/auth/send-otp", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export function loginApi(payload: LoginRequest) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

// ===== Google OAuth =====

export async function initGoogleOAuthApi(params: {
  returnUrl: string;
  callbackUrl?: string;
}) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");

  const url = new URL(`${base}/auth/google`);

  // BE mới thường dùng snake_case
  url.searchParams.set("return_url", params.returnUrl);
  // giữ thêm camelCase phòng BE đang đọc kiểu này
  url.searchParams.set("returnUrl", params.returnUrl);

  if (params.callbackUrl) {
    // optional: chỉ cần nếu BE build authUrl dựa vào callback FE
    url.searchParams.set("callback_url", params.callbackUrl);
    url.searchParams.set("callbackUrl", params.callbackUrl);
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15000);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      credentials: "omit",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new Error("Init Google OAuth timeout (BE không phản hồi trong 15s)");
    }
    throw e;
  } finally {
    clearTimeout(t);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Init Google OAuth failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as GoogleInitResponse;
  if (!data.success) throw new Error(data.message ?? "Init Google OAuth failed");
  return data;
}

export async function googleCallbackApi(params: { code: string; state: string }) {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google/callback`
  );
  url.searchParams.set("code", params.code);
  url.searchParams.set("state", params.state);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) throw new Error("Google callback failed");

  const data = (await res.json()) as GoogleCallbackResponse;
  if (!data.success) throw new Error(data.message ?? "Google callback failed");

  return data;
}