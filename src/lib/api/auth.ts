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
 //===== Google OAuth =====
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


// export async function initGoogleOAuthApi(params: { returnUrl: string }) {
//   // TODO: sửa baseURL theo style bạn đang dùng trong loginApi (fetch/axios)
//   const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`);
//   url.searchParams.set("returnUrl", params.returnUrl);

//   const res = await fetch(url.toString(), { method: "GET" });
//   if (!res.ok) throw new Error("Init Google OAuth failed");

//   const data = (await res.json()) as GoogleInitResponse;
//   if (!data.success) throw new Error(data.message ?? "Init Google OAuth failed");

//   return data;
// }