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
