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

export type LoginRequest = { email: string; password: string };

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

export async function initGoogleOAuthApi(params: { returnUrl: string }) {
  // TODO: sửa baseURL theo style bạn đang dùng trong loginApi (fetch/axios)
  const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`);
  url.searchParams.set("returnUrl", params.returnUrl);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) throw new Error("Init Google OAuth failed");

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
