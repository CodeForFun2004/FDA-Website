// src/features/profile/api/user-profile.ts
import { apiFetch } from '@/lib/api/client';

// ===== Types =====
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

export type UpdateProfileResponse = {
  success: boolean;
  message: string;
  profile: ApiProfile;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordResponse = {
  success: boolean;
  message: string;
};

export type UpdatePhoneNumberRequest = {
  newPhoneNumber: string;
  otpCode: string;
};

export type UpdatePhoneNumberResponse = {
  success: boolean;
  message: string;
  profile: ApiProfile;
};

// ===== API Functions =====

/**
 * GET /user-profile
 * Lấy thông tin profile của user đang đăng nhập
 */
export function getUserProfileApi() {
  return apiFetch<GetProfileResponse>('/user-profile', {
    method: 'GET'
  });
}

/**
 * PUT /user-profile
 * Cập nhật thông tin profile (multipart/form-data)
 * - fullName: string
 * - avatarFile: File (optional)
 * - avatarUrl: string (optional)
 */
export function updateUserProfileApi(formData: FormData) {
  return apiFetch<UpdateProfileResponse>('/user-profile', {
    method: 'PUT',
    body: formData
  });
}

/**
 * POST /auth/change-password
 * Đổi mật khẩu
 */
export function changePasswordApi(payload: ChangePasswordRequest) {
  return apiFetch<ChangePasswordResponse>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * POST /user-profile/update-phoneNumber
 * Update phone number using OTP
 */
export function updatePhoneNumberApi(payload: UpdatePhoneNumberRequest) {
  return apiFetch<UpdatePhoneNumberResponse>(
    '/user-profile/update-phoneNumber',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
}
