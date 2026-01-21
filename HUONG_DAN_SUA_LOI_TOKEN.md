# 🔐 Hướng Dẫn Sửa Lỗi Token - Ngắn Gọn

## ❌ Vấn Đề Bạn Đang Gặp

1. **Token cũ trong localStorage** - không tự động refresh
2. **401 Unauthorized errors** - khi gọi API ở các feature khác (ngoài stations)
3. **Refresh token không hoạt động** - token hết hạn nhưng không được làm mới

## ✅ Giải Pháp - 3 Bước Đơn Giản

### **BƯỚC 1: Clear Token Cũ (QUAN TRỌNG NHẤT!)**

Mở Browser Console (F12) và chạy:

```javascript
// Option 1: Clear tất cả localStorage
localStorage.clear();
location.reload();

// Option 2: Chỉ clear auth data
localStorage.removeItem('fda_auth');
location.reload();
```

### **BƯỚC 2: Thêm Auto-Refresh Hook**

Cập nhật file `src/features/admin/components/AdminShell.tsx`:

```typescript
'use client';

import { useAuthRefresh, useValidateToken } from '@/hooks/use-auth-refresh';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  // ✅ THÊM 2 DÒNG NÀY
  useAuthRefresh();      // Tự động refresh token mỗi phút
  useValidateToken();    // Kiểm tra token khi load page

  // ... code cũ của bạn ...
}
```

### **BƯỚC 3: Sử dụng Global Auth Utils**

Trong BẤT KỲ feature nào (alerts, zones, devices, v.v.), thay đổi cách lấy token:

```typescript
// ❌ CÁCH CŨ (SAI)
import { useAuthStore } from '@/features/authenticate/store/auth-store';
const token = useAuthStore.getState().accessToken; // ← Có thể đã hết hạn!

// ✅ CÁCH MỚI (ĐÚNG)
import { getAccessToken } from '@/lib/auth-utils';
const token = await getAccessToken(); // ← Tự động refresh nếu cần!
```

**Hoặc đơn giản hơn, chỉ cần dùng `apiFetch`:**

```typescript
import { apiFetch } from '@/lib/api/client';

// apiFetch đã tự động xử lý token refresh rồi!
const data = await apiFetch('/api/your-endpoint');
```

---

## 🚀 Files Mới Đã Tạo

1. **`src/lib/auth-utils.ts`** - Global token management (dùng cho mọi feature)
2. **`src/hooks/use-auth-refresh.ts`** - Hook tự động refresh token
3. **`src/lib/clear-old-tokens.ts`** - Utilities để clear token cũ

---

## 🔧 Debug Khi Cần

Nếu vẫn gặp lỗi, chạy trong console:

```javascript
// Check auth state hiện tại
import { debugAuthState } from '@/lib/auth-utils';
debugAuthState();

// Check localStorage
import { debugLocalStorageAuth } from '@/lib/clear-old-tokens';
debugLocalStorageAuth();

// Clear tất cả và bắt đầu lại
import { clearAllAuthData } from '@/lib/clear-old-tokens';
clearAllAuthData();
```

---

## ✅ Kết Quả Sau Khi Fix

✅ Token tự động refresh trước khi hết hạn  
✅ Không còn 401 errors  
✅ Hoạt động ở MỌI feature (không chỉ stations)  
✅ LocalStorage luôn có token hợp lệ  

---

## 📋 Checklist

- [ ] Clear localStorage (`localStorage.clear()`)
- [ ] Thêm `useAuthRefresh()` vào AdminShell
- [ ] Login lại để có token mới
- [ ] Test API calls ở các feature khác
- [ ] Verify token auto-refresh hoạt động (check console logs)

---

## 💡 Giải Thích Ngắn

**Tại sao có vấn đề này?**
- Token được lưu trong localStorage qua zustand persist
- Khi load lại page, token cũ được restore nhưng không kiểm tra expiry
- Các feature khác (ngoài stations) lấy token trực tiếp từ store → lấy token đã hết hạn

**Giải pháp làm gì?**
- Tạo global `getAccessToken()` - tự động check và refresh
- API Client bây giờ dùng global function thay vì lấy trực tiếp
- Hook `useAuthRefresh()` chạy background refresh mỗi phút
- Clear old tokens trong localStorage

---

**Cần trợ giúp?** Đọc file `AUTHENTICATION_FIX.md` để biết chi tiết hơn!
