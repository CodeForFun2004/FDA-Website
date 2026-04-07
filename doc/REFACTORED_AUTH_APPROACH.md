# 🔄 Refactored Auth Approach - Đúng Tinh Thần ReactJS

## ✅ **CẢI TIẾN: Logic Bây Giờ Ở Trong Store!**

Theo góp ý của bạn, tôi đã refactor để **tất cả logic nằm trong Zustand Store** thay vì helper bên ngoài. Đây là cách **đúng chuẩn React/Zustand** hơn!

---

## 🎯 **So Sánh: Trước vs Sau**

### **❌ Cách Cũ (Helper Pattern):**

```typescript
// Logic ở NGOÀI store (auth-utils.ts)
export async function getAccessToken() {
  const store = useAuthStore.getState();
  
  // Logic check expiry
  if (store.isTokenExpired()) {
    await store.refreshSession();
  }
  
  return store.accessToken;
}

// Store chỉ lưu data
useAuthStore = {
  accessToken: string,
  isTokenExpired: () => boolean,
  refreshSession: () => Promise<boolean>
}
```

**Vấn đề:**
- ❌ Logic tách rời khỏi state management
- ❌ Không theo Zustand best practices
- ❌ Helper functions thêm complexity

---

### **✅ Cách Mới (Store-First Pattern):**

```typescript
// TOÀN BỘ logic TRONG store (auth-store.ts)
useAuthStore = {
  accessToken: string,
  refreshToken: string,
  
  // ✅ Logic auto-refresh TRỰC TIẾP trong store!
  getValidToken: async () => {
    if (isTokenExpired()) {
      await refreshSession();
      return get().accessToken;
    }
    return accessToken;
  },
  
  isTokenExpired: () => boolean,
  refreshSession: () => Promise<boolean>
}

// Helper chỉ là thin wrapper (auth-utils.ts)
export async function getAccessToken() {
  // Delegate to store method
  return await useAuthStore.getState().getValidToken();
}
```

**Ưu điểm:**
- ✅ **Single Responsibility**: Store quản lý TẤT CẢ auth logic
- ✅ **Separation of Concerns**: Data + Logic cùng một nơi
- ✅ **Testable**: Dễ test vì logic trong store
- ✅ **Idiomatic**: Đúng Zustand patterns
- ✅ **React Philosophy**: Single source of truth

---

## 📊 **Architecture Mới**

```
┌──────────────────────────────────────────────────────────┐
│                      APPLICATION                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Components / Features / API Calls                      │
│         ↓                                                │
│  ┌──────────────────────────────────────────┐          │
│  │  ✅ ZUSTAND AUTH STORE                   │          │
│  │  (Single Source of Truth + Logic)        │          │
│  │                                           │          │
│  │  STATE:                                   │          │
│  │  - accessToken                            │          │
│  │  - refreshToken                           │          │
│  │  - user, status, expiresAt                │          │
│  │                                           │          │
│  │  METHODS:                                 │          │
│  │  - login(), logout()                      │          │
│  │  - refreshSession()                       │          │
│  │  - isTokenExpired()                       │          │
│  │  - isTokenExpiringSoon()                  │          │
│  │  ✨ getValidToken() ← AUTO-REFRESH!      │          │
│  │                                           │          │
│  │  PERSIST:                                 │          │
│  │  - localStorage: "fda_auth"               │          │
│  └──────────────────────────────────────────┘          │
│         ↑                                                │
│  ┌──────────────────────────────────────────┐          │
│  │  Auth Utils (Optional Wrappers)           │          │
│  │  - getAccessToken() → store.getValidToken()│         │
│  │  - Just convenience functions              │          │
│  └──────────────────────────────────────────┘          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 💻 **Cách Sử Dụng**

### **Option 1: Dùng Store Trực Tiếp (Recommended)**

```typescript
// Trong bất kỳ component/feature nào
import { useAuthStore } from '@/features/authenticate/store/auth-store';

// ✅ Get token with auto-refresh từ store
const token = await useAuthStore.getState().getValidToken();

// ✅ Hoặc trong React component
const getValidToken = useAuthStore(state => state.getValidToken);
const token = await getValidToken();
```

**Ưu điểm:**
- Trực tiếp dùng store method
- Không qua layer trung gian
- Rõ ràng, explicit

### **Option 2: Dùng Helper (Convenience)**

```typescript
// Helper chỉ là thin wrapper
import { getAccessToken } from '@/lib/auth-utils';

const token = await getAccessToken();
// ↓ internally calls
// useAuthStore.getState().getValidToken()
```

**Ưu điểm:**
- API đơn giản hơn
- Backward compatible
- Easy to migrate existing code

### **Option 3: API Client (Automatic)**

```typescript
import { apiFetch } from '@/lib/api/client';

// ✅ apiFetch automatically calls store.getValidToken()
// No manual token management needed!
const data = await apiFetch('/api/endpoint');
```

---

## 🔑 **Core Method: `getValidToken()`**

Đây là method chính trong auth store:

```typescript
// In auth-store.ts
getValidToken: async () => {
  const state = get();
  const { accessToken, isTokenExpired, isTokenExpiringSoon, refreshSession } = state;

  // 1. Check if token exists
  if (!accessToken) {
    return null;
  }

  // 2. Check if expired → must refresh
  if (isTokenExpired()) {
    console.log('[Auth Store] Token expired, refreshing...');
    const success = await refreshSession();
    return success ? get().accessToken : null;
  }

  // 3. Check if expiring soon → proactive refresh
  if (isTokenExpiringSoon(5)) {
    console.log('[Auth Store] Token expiring soon, refreshing proactively...');
    // Background refresh, don't wait
    refreshSession().catch(err => {
      console.error('[Auth Store] Background refresh failed:', err);
    });
  }

  // 4. Return valid token
  return accessToken;
}
```

**Features:**
- ✅ Auto-check expiry
- ✅ Auto-refresh if expired
- ✅ Proactive refresh if expiring soon
- ✅ Background refresh (non-blocking)
- ✅ Error handling

---

## 🎓 **Tại Sao Cách Này Tốt Hơn?**

### **1. Đúng React/Zustand Philosophy**

```
"State và logic liên quan đến state
 nên ở cùng một nơi" - Zustand Docs
```

- Store không chỉ lưu data, mà còn chứa business logic
- Separation of concerns: Auth logic ở auth store
- Single responsibility: Store tự quản lý lifecycle của tokens

### **2. Better Testability**

```typescript
// Dễ test hơn vì logic trong store
import { useAuthStore } from '@/features/authenticate/store/auth-store';

test('getValidToken refreshes expired token', async () => {
  const store = useAuthStore.getState();
  
  // Setup expired token
  store.accessToken = 'expired_token';
  store.expiresAt = new Date('2020-01-01').toISOString();
  
  // Mock refreshSession
  jest.spyOn(store, 'refreshSession').mockResolvedValue(true);
  
  // Test
  const token = await store.getValidToken();
  
  expect(store.refreshSession).toHaveBeenCalled();
});
```

### **3. Cleaner API Surface**

```typescript
// ❌ Trước: Nhiều helpers riêng lẻ
import { getAccessToken, forceRefresh, isAuthenticated } from '@/lib/auth-utils';

// ✅ Sau: Tất cả trong store
import { useAuthStore } from '@/features/authenticate/store/auth-store';

const { getValidToken, isTokenExpired, refreshSession } = useAuthStore.getState();
```

### **4. Better Developer Experience**

- Type-safe: TypeScript check tất cả methods trong store
- Autocomplete: IDE suggest tất cả methods
- Single import: Không cần nhớ nhiều helpers
- Consistent API: Tất cả auth operations qua store

---

## 🔄 **Migration Path**

### **Hiện Tại (Backward Compatible):**

Cả 2 cách đều hoạt động:

```typescript
// Cách 1: Store direct (recommended)
const token = await useAuthStore.getState().getValidToken();

// Cách 2: Helper wrapper (convenience)
const token = await getAccessToken();
```

### **Roadmap:**

1. ✅ **Phase 1** (Done): Add `getValidToken()` to store
2. ✅ **Phase 2** (Done): Update helpers to delegate to store
3. 🔄 **Phase 3** (Optional): Migrate all features to use store directly
4. 🔄 **Phase 4** (Optional): Remove helper wrappers if not needed

---

## ✨ **Best Practices**

### **DO:**

✅ Use `store.getValidToken()` when you need a token
✅ Let the store handle refresh logic
✅ Use helpers for convenience if preferred
✅ Trust the store to manage token lifecycle

### **DON'T:**

❌ Directly access `store.accessToken` without validation
❌ Implement token refresh logic outside the store
❌ Check expiry manually - use `getValidToken()`
❌ Call `refreshSession()` manually unless needed

---

## 📝 **Code Examples**

### **Example 1: In React Component**

```typescript
'use client';

import { useAuthStore } from '@/features/authenticate/store/auth-store';

export function ProfilePage() {
  const getValidToken = useAuthStore(state => state.getValidToken);
  
  const fetchProfile = async () => {
    const token = await getValidToken();
    if (!token) {
      // Handle no auth
      return;
    }
    
    // Use token
    const response = await fetch('/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
  };
  
  return <button onClick={fetchProfile}>Load Profile</button>;
}
```

### **Example 2: In API Service**

```typescript
import { useAuthStore } from '@/features/authenticate/store/auth-store';

export async function fetchUserData() {
  const token = await useAuthStore.getState().getValidToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  return fetch('/api/user', {
    headers: { Authorization: `Bearer ${token}` }
  });
}
```

### **Example 3: In React Query**

```typescript
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import { useQuery } from '@tanstack/react-query';

export function useUserData() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = await useAuthStore.getState().getValidToken();
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch('/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.json();
    }
  });
}
```

---

## 🎯 **Kết Luận**

### **Cách Mới Đúng Hơn Vì:**

1. ✅ **Store-first**: Logic trong store, không ở helpers
2. ✅ **React philosophy**: Single source of truth
3. ✅ **Zustand patterns**: State + methods together
4. ✅ **Testable**: Easy to mock và test
5. ✅ **Maintainable**: Tất cả auth logic ở một chỗ
6. ✅ **Type-safe**: Full TypeScript support
7. ✅ **DX**: Better developer experience

### **So với Cách Cũ:**

| Aspect | Cách Cũ (Helpers) | Cách Mới (Store-first) |
|--------|-------------------|------------------------|
| Logic location | Outside store | ✅ Inside store |
| Separation of concerns | ❌ Mixed | ✅ Clear |
| React philosophy | ❌ Not aligned | ✅ Aligned |
| Testability | Medium | ✅ High |
| API surface | Multiple functions | ✅ Single store |
| Maintainability | Medium | ✅ High |

---

**Cảm ơn góp ý của bạn!** Cách này thực sự **tốt hơn và đúng chuẩn hơn** so với helper pattern ban đầu! 🎉
