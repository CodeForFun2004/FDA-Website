# 🔐 Forgot Password Flow Documentation

## 📋 Tổng quan

Chức năng "Quên mật khẩu" đã được tích hợp vào authentication flow, cho phép người dùng đặt lại mật khẩu thông qua OTP.

## 🔄 Luồng hoạt động

### **Bước 1: Identifier Input (Email/Phone)**
- User nhập email hoặc số điện thoại
- Click vào link **"Quên mật khẩu?"** ở dưới nút "Tiếp tục"
- Hoặc click vào link **"Quên mật khẩu?"** bên cạnh label "Password" (nếu đã ở step PASSWORD)

### **Bước 2: Send OTP**
- Hệ thống gọi API `POST /auth/send-otp` với body:
  ```json
  {
    "identifier": "user@example.com" // hoặc phone number
  }
  ```
- OTP được gửi đến email/phone của user
- `flowMode` chuyển sang `'FORGOT_PASSWORD'`
- Hiển thị message: "OTP đặt lại mật khẩu đã được gửi!"

### **Bước 3: OTP Verification**
- User nhập 6 số OTP
- Hiển thị thông báo: "Sau khi xác minh, bạn sẽ được yêu cầu đặt mật khẩu mới"
- Nút submit có text: "Xác minh OTP" (thay vì "Đăng nhập")
- Khi submit, system gọi API `POST /auth/login` với OTP

### **Bước 4: Auto Login**
- Sau khi verify OTP thành công → User được tự động đăng nhập
- `accessToken` và `refreshToken` được lưu vào store

### **Bước 5: Reset Password Modal**
- Ngay sau khi login thành công (nếu `flowMode === 'FORGOT_PASSWORD'`)
- Modal popup hiển thị form đặt lại mật khẩu mới
- User nhập password mới (không cần email vì đã login)

## 🎨 UI Components

### **1. Login Flow Updates**
File: `src/features/authenticate/components/login-flow.tsx`

**Thay đổi:**
- ✅ Thêm state `flowMode: 'NORMAL' | 'FORGOT_PASSWORD'`
- ✅ Thêm state `showSetPasswordModal`
- ✅ Thêm function `handleForgotPassword()`
- ✅ Cập nhật `handleLoginOtp()` để hiển thị modal sau login
- ✅ Thêm link "Quên mật khẩu?" ở IDENTIFIER step
- ✅ Thêm link "Quên mật khẩu?" ở PASSWORD step
- ✅ Cập nhật OTP step để hiển thị message khác nhau cho forgot password flow

### **2. Reset Password Modal (NEW)**
File: `src/features/authenticate/components/set-password-modal.tsx`

**Features:**
- ✅ Form nhập mật khẩu mới + xác nhận mật khẩu
- ✅ Show/hide password toggles
- ✅ Real-time password validation với checklist:
  - Ít nhất 8 ký tự
  - Có chữ hoa (A-Z)
  - Có chữ thường (a-z)
  - Có số (0-9)
  - Có ký tự đặc biệt (!@#$...)
- ✅ Password match indicator
- ✅ Loading state khi submit
- ✅ Gọi API `POST /auth/reset-password` (requires accessToken)
- ✅ Không cần gửi email (đã authenticated)

## 🔌 API Integration

### **1. Updated API File**
File: `src/features/authenticate/api/auth.api.ts`

**Thêm function mới:**
```typescript
export function resetPasswordApi(payload: {
  newPassword: string;
  confirmPassword: string;
}) {
  return apiFetch<{ success: boolean; message: string }>('/auth/reset-password', {
    method: 'POST',
    auth: true, // ✅ Requires accessToken from OTP login
    body: JSON.stringify(payload)
  });
}
```

### **2. API Endpoints Used**

#### Send OTP (Forgot Password)
```
POST /auth/send-otp
Body: { "identifier": "email/phone" }
Response: { success, message, expiresAt }
```

#### Login with OTP
```
POST /auth/login
Body: { 
  "identifier": "email/phone",
  "otpCode": "123456",
  "password": null 
}
Response: { 
  success, 
  message, 
  accessToken, 
  refreshToken, 
  expiresAt, 
  user 
}
```

#### Reset Password
```
POST /auth/reset-password
Headers: { "Authorization": "Bearer <accessToken>" }
Body: { 
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!" 
}
Response: { success, message }
```

## 🎯 Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: IDENTIFIER Input                                    │
│  - User nhập email/phone                                     │
│  - Click "Quên mật khẩu?"                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Send OTP                                           │
│  - API: POST /auth/send-otp                                 │
│  - flowMode = 'FORGOT_PASSWORD'                             │
│  - OTP được gửi đến email/phone                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: OTP Verification                                   │
│  - User nhập 6 số OTP                                       │
│  - Message: "Sau khi xác minh, bạn sẽ đặt password mới"   │
│  - Submit → API: POST /auth/login (with OTP)                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Auto Login                                         │
│  - User được login tự động                                   │
│  - accessToken + refreshToken được lưu                      │
│  - Auth store update với user info                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Reset Password Modal                               │
│  - Modal popup tự động                                       │
│  - User nhập password mới + confirm                         │
│  - API: POST /auth/reset-password (with accessToken)        │
│  - Success → onLoggedIn() callback                          │
└─────────────────────────────────────────────────────────────┘
```

## 🔒 Security Notes

1. **OTP Verification**: OTP được verify thông qua login API, đảm bảo user có quyền truy cập account
2. **AccessToken Required**: API reset-password yêu cầu accessToken, chỉ user đã login mới có thể reset password
3. **No Email in Request**: Email không cần gửi vì user đã authenticated, tăng security
4. **Password Validation**: Enforced cả client-side (UI) và server-side (API)
5. **Token Rotation**: Sau khi login, refreshToken được rotate để tăng security

## 🎨 UX Improvements

1. **Visual Feedback**: 
   - Loading states cho tất cả async operations
   - Success/error toasts với messages rõ ràng
   - Real-time password validation với checkmarks

2. **User Guidance**:
   - Info box ở OTP step giải thích next step
   - Password requirements checklist
   - Password match indicator

3. **Flow Clarity**:
   - Button text thay đổi theo context ("Xác minh OTP" vs "Đăng nhập")
   - Different messages cho forgot password flow
   - Clear call-to-action ở mỗi step

## 📝 Testing Checklist

- [ ] User có thể click "Quên mật khẩu?" từ IDENTIFIER step
- [ ] User có thể click "Quên mật khẩu?" từ PASSWORD step
- [ ] OTP được gửi thành công
- [ ] OTP countdown timer hoạt động
- [ ] Resend OTP button disabled cho đến khi hết hạn
- [ ] OTP verification thành công → auto login
- [ ] Set Password modal hiển thị sau login
- [ ] Password validation rules hoạt động real-time
- [ ] Set password API call thành công
- [ ] User có thể login lại bằng password mới
- [ ] Error handling cho tất cả edge cases
- [ ] Toast messages hiển thị đúng

## 🚀 Next Steps (Optional Enhancements)

1. **Remember Device**: Cho phép user skip set password nếu đăng nhập từ trusted device
2. **Password Strength Meter**: Visual indicator cho password strength
3. **Biometric Auth**: Face ID / Touch ID integration cho mobile
4. **Rate Limiting**: Limit số lần request OTP trong time window
5. **Email Template**: Custom email template cho OTP forgot password

---

**Created**: 2026-01-30  
**Last Updated**: 2026-01-30  
**Author**: FDA Development Team
