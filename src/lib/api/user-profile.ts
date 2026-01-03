import { apiFetch } from "./client";

export type ApiProfile = {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;

  provider?: string | null;
  status?: string | null;
  lastLoginAt?: string | null;
  phoneVerifiedAt?: string | null;
  emailVerifiedAt?: string | null;
  roles: string[];

  createdAt?: string | null;
  updatedAt?: string | null;
};

export type GetProfileResponse = {
  success: boolean;
  message: string;
  profile: ApiProfile;
};

export function getUserProfileApi() {
  return apiFetch<GetProfileResponse>("/user-profile", {
    method: "GET",
    // auth mặc định true rồi
  });
}

// PUT multipart/form-data: fullName, avatarFile, avatarUrl (tùy)
export function updateUserProfileApi(formData: FormData) {
  return apiFetch<GetProfileResponse>("/user-profile", {
    method: "PUT",
    body: formData,
  });
}

export function changePasswordApi(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  return apiFetch<{ success: boolean; message: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
