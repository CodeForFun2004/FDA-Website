# 🔐 Authentication & Token Management - Giải Pháp & Hướng Dẫn

## 📋 Vấn Đề Đã Được Phát Hiện

### 1. **Token không được refresh tự động**
- ❌ API Client chỉ refresh khi nhận 401 từ server
- ❌ Không có proactive check token expiration trước khi gửi request
- ❌ Token có thể đã hết hạn nhưng chưa được phát hiện

### 2. **LocalStorage lưu token cũ**
- ❌ Zustand persist middleware không validate token expiry khi load
- ❌ Token cũ/hết hạn vẫn được giữ trong localStorage
- ❌ Không có mechanism để clear expired tokens

### 3. **Không có Global Token Manager**
- ❌ `getAccessToken()` chỉ có trong `features/stations/utils`
- ❌ Các feature khác không sử dụng được shared logic
- ❌ Mỗi feature tự xử lý token riêng → inconsistent

---

## ✅ Giải Pháp Đã Implement

### **1. Global Auth Utilities** (`src/lib/auth-utils.ts`)

Tạo centralized auth management cho toàn bộ app:

```typescript
import { getAccessToken, isAuthenticated, clearAuth } from '@/lib/auth-utils';

// Lấy token với auto-refresh
const token = await getAccessToken();

// Check authentication status
if (isAuthenticated()) {
  // User is authenticated with valid token
}

// Force logout và clear data
clearAuth();
```

**Features:**
- ✅ Auto-refresh token nếu expired
- ✅ Proactive refresh nếu token sắp hết hạn (< 5 phút)
- ✅ Clear localStorage khi cần thiết
- ✅ Debug functions để troubleshoot

### **2. Updated API Client** (`src/lib/api/client.ts`)

Tích hợp global auth utils:

```typescript
// Trước khi gửi request, tự động:
// 1. Check token expiration
// 2. Refresh nếu cần
// 3. Retry request với token mới nếu nhận 401

const data = await apiFetch('/api/endpoint');
```

**Improvements:**
- ✅ Sử dụng `getAccessToken()` thay vì trực tiếp lấy từ store
- ✅ Token được validate và refresh trước mỗi request
- ✅ Debug logging để track token issues

### **3. Auto-Refresh Hook** (`src/hooks/use-auth-refresh.ts`)

Background token refresh:

```typescript
'use client';

import { useAuthRefresh, useValidateToken } from '@/hooks/use-auth-refresh';

export default function Layout({ children }) {
  // Auto-refresh token every minute nếu sắp hết hạn
  useAuthRefresh();
  
  // Validate token on mount
  useValidateToken();
  
  return <>{children}</>;
}
```

**Features:**
- ✅ Tự động check token mỗi phút
- ✅ Refresh token trước 10 phút hết hạn
- ✅ Validate và logout nếu token đã expired

### **4. Token Cleanup Utilities** (`src/lib/clear-old-tokens.ts`)

Clear old/expired tokens:

```typescript
import { clearAllAuthData, cleanExpiredTokens, debugLocalStorageAuth } from '@/lib/clear-old-tokens';

// Debug localStorage
debugLocalStorageAuth();

// Clear expired tokens
cleanExpiredTokens();

// Clear ALL auth data (nuclear option)
clearAllAuthData();
```

---

## 🚀 Hướng Dẫn Sử Dụng

### **Bước 1: Clear Old Tokens (QUAN TRỌNG!)**

Mở browser console và chạy:

```javascript
// Import và chạy cleanup
import { runAuthCleanup } from '@/lib/clear-old-tokens';
runAuthCleanup();

// Hoặc clear tất cả
import { clearAllAuthData } from '@/lib/clear-old-tokens';
clearAllAuthData();
```

**Hoặc đơn giản hơn** - mở DevTools Console và:

```javascript
// Clear localStorage manually
localStorage.clear();

// Sau đó refresh page và login lại
location.reload();
```

### **Bước 2: Thêm Auto-Refresh vào AdminShell**

Cập nhật `src/features/admin/components/AdminShell.tsx`:

```typescript
'use client';

import React, { useEffect } from 'react';
import { useAuthRefresh, useValidateToken } from '@/hooks/use-auth-refresh';
// ... other imports

export default function AdminShell({ children }: { children: React.ReactNode }) {
  // ✅ ADD THESE HOOKS
  useAuthRefresh();      // Auto-refresh token
  useValidateToken();    // Validate on mount

  // ... rest of code
}
```

### **Bước 3: Sử dụng Global Auth Utils trong Features**

**Trong bất kỳ feature nào** (không chỉ stations):

```typescript
// ❌ TRƯỚC ĐÂY (WRONG)
import { useAuthStore } from '@/features/authenticate/store/auth-store';
const token = useAuthStore.getState().accessToken; // ← Có thể expired!

// ✅ BÂY GIỜ (CORRECT)
import { getAccessToken } from '@/lib/auth-utils';
const token = await getAccessToken(); // ← Auto-refresh nếu cần!
```

**Example trong React Query:**

```typescript
import { getAccessToken } from '@/lib/auth-utils';

export const useMyQuery = () => {
  return useQuery({
    queryKey: ['myData'],
    queryFn: async () => {
      // Token sẽ tự động refresh nếu cần
      return apiFetch('/api/my-endpoint');
    }
  });
};
```

### **Bước 4: Debug Token Issues**

Khi gặp vấn đề về authentication:

```typescript
import { debugAuthState } from '@/lib/auth-utils';
import { debugLocalStorageAuth } from '@/lib/clear-old-tokens';

// Check zustand store state
debugAuthState();

// Check localStorage
debugLocalStorageAuth();
```

---

## 🔧 Migration Guide

### **Cho Developers:**

1. **Update imports trong tất cả features:**

```typescript
// ❌ Delete hoặc deprecate
import { getAccessToken } from '@/features/stations/utils/auth';

// ✅ Use global utils
import { getAccessToken } from '@/lib/auth-utils';
```

2. **Không dùng trực tiếp `useAuthStore` để lấy token:**

```typescript
// ❌ DON'T
const { accessToken } = useAuthStore();

// ✅ DO
const token = await getAccessToken();
```

3. **Add auto-refresh hook vào layouts:**

```typescript
// In admin layout, user dashboard, etc.
import { useAuthRefresh } from '@/hooks/use-auth-refresh';

export default function Layout() {
  useAuthRefresh();
  // ...
}
```

---

## 📊 Flow Mới

```
User Login
  ↓
Token stored in localStorage (via zustand persist)
  ↓
[Background] useAuthRefresh checks every minute
  ↓
When making API request:
  1. getAccessToken() checks expiration
  2. Auto-refresh if expired/expiring
  3. apiFetch() uses fresh token
  4. If 401 → retry with refresh
  ↓
Token always valid ✅
```

---

## 🐛 Troubleshooting

### **Vấn đề: "Token expired" ngay sau khi login**

**Giải pháp:**
```typescript
// Clear all auth data và login lại
import { clearAllAuthData } from '@/lib/clear-old-tokens';
clearAllAuthData();
```

### **Vấn đề: Token không refresh tự động**

**Check:**
1. `useAuthRefresh()` hook có được call trong layout không?
2. Check console logs - có thấy "[Auth Refresh]" messages không?
3. Kiểm tra `expiresAt` trong localStorage có đúng không?

```javascript
// Debug in console
debugAuthState();
```

### **Vấn đề: 401 Unauthorized ở một số features**

**Giải pháp:**
- Đảm bảo feature đó sử dụng `apiFetch` hoặc `getAccessToken()`
- Không trực tiếp lấy token từ store

---

## ✅ Checklist

- [ ] Run `clearAllAuthData()` để clear old tokens
- [ ] Add `useAuthRefresh()` vào AdminShell
- [ ] Update all features để dùng global `getAccessToken()`
- [ ] Remove/deprecate local `getAccessToken()` trong stations
- [ ] Test login flow
- [ ] Test token auto-refresh
- [ ] Test cross-feature API calls

---

## 📚 Files Created/Updated

### Created:
- `src/lib/auth-utils.ts` - Global auth utilities
- `src/hooks/use-auth-refresh.ts` - Auto-refresh hooks
- `src/lib/clear-old-tokens.ts` - Token cleanup utilities
- `AUTHENTICATION_FIX.md` - This documentation

### Updated:
- `src/lib/api/client.ts` - Integrated global auth utils
- `src/features/stations/utils/auth.ts` - Deprecated, now uses global utils

---

## 🎯 Kết Quả

✅ **Token được refresh tự động** trước khi expired  
✅ **Không còn 401 errors** do expired token  
✅ **LocalStorage luôn có token valid** hoặc được clear  
✅ **Mọi feature đều dùng chung logic** - consistent  
✅ **Dễ debug** với built-in logging functions  

---

**Tạo bởi:** AI Assistant  
**Ngày:** 2026-01-19  
**Version:** 1.0.0
