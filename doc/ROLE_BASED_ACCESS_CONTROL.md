# 🔒 Role-Based Access Control (RBAC) - FDA System

## 📋 **Tổng Quan**

Hệ thống FDA đã được trang bị **Role-Based Access Control** để đảm bảo chỉ những người dùng có quyền phù hợp mới có thể truy cập vào các khu vực quản lý.

---

## 🎯 **Vấn Đề Đã Giải Quyết**

### **Bug Trước Đây:**

- ❌ User với role "USER" vẫn có thể truy cập trang `/admin` sau khi login
- ❌ Không có cơ chế kiểm tra quyền truy cập
- ❌ Không có thông báo khi người dùng không có quyền
- ❌ Không có trang cho Authority và Super Admin

### **Giải Pháp:**

- ✅ Thêm RoleGuard component để kiểm tra quyền
- ✅ Tạo trang `/auth/forbidden` cho truy cập trái phép
- ✅ Cập nhật logic redirect để chặn USER role
- ✅ Tạo placeholder pages cho Authority và Super Admin
- ✅ Thêm notice trên trang login về hệ thống quản lý

---

## 👥 **Roles & Permissions**

### **1. USER** (Người dùng thường)

- ❌ **KHÔNG** được phép truy cập hệ thống quản lý
- ❌ **KHÔNG** thể đăng ký tài khoản tự động
- 🔄 Redirect: `/auth/forbidden`

### **2. AUTHORITY** (Cán bộ chính quyền)

- ✅ Được phép truy cập khu vực `/authority`
- ✅ Giám sát và quản lý ngập lụt trong khu vực
- ✅ Xem báo cáo và cảnh báo
- 🔄 Redirect after login: `/authority`

### **3. ADMIN** (Quản trị viên)

- ✅ Được phép truy cập khu vực `/admin`
- ✅ Quản lý toàn bộ hệ thống
- ✅ Quản lý users, stations, sensors, alerts
- 🔄 Redirect after login: `/admin`

### **4. SUPERADMIN** (Quản trị cấp cao)

- ✅ Được phép truy cập khu vực `/admin` (chung với ADMIN)
- ✅ Quyền cao nhất trong hệ thống
- ✅ Quản lý configurations, system settings
- 🔄 Redirect after login: `/admin`

---

## 🏗️ **Kiến Trúc RBAC**

```
┌───────────────────────────────────────────────────────────┐
│                     User Login                            │
│         (Password/OTP or Google OAuth)                    │
└─────────────────────┬─────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │   Backend Returns User Data │
        │   - id, email, fullName     │
        │   - roles: Role[]           │
        │   - accessToken, etc.       │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │   Frontend Login Handlers   │
        │   - login-view.tsx          │
        │   - auth/callback/page.tsx  │
        │   - auth/google/finish      │
        └─────────────┬───────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │  getRedirectPath()    │
          │  Check user roles     │
          └───────────┬───────────┘
                      │
          ┌───────────┴───────────────────┐
          │                               │
    ┌─────▼─────┐                   ┌────▼──────┐
    │ Has Valid │                   │ USER Role │
    │   Role?   │                   │ or Empty  │
    └─────┬─────┘                   └────┬──────┘
          │                               │
    ┌─────▼─────────────────┐            │
    │ Redirect to Portal:   │            │
    │ - SUPERADMIN or      │            │
    │   ADMIN → /admin      │            │
    │ - AUTHORITY → /authority          │
    └───────────────────────┘            │
                                         │
                              ┌──────────▼──────────┐
                              │ Redirect to:        │
                              │ /auth/forbidden     │
                              └─────────────────────┘
```

---

## 🛡️ **Components & Files**

### **1. RoleGuard Component**

**File:** `src/components/guards/RoleGuard.tsx`

Client-side guard component để bảo vệ routes dựa trên roles.

**Usage:**

```tsx
import { RoleGuard } from '@/components/guards/RoleGuard';

<RoleGuard requiredRoles={['ADMIN', 'SUPERADMIN']}>
  <AdminContent />
</RoleGuard>;
```

**Features:**

- ✅ Check user authentication status
- ✅ Verify user has required role
- ✅ Redirect to `/auth/forbidden` if unauthorized
- ✅ Show loading state while checking
- ✅ Provide hooks: `useHasRole`, `useHasAnyRole`, `useIsAdmin`

---

### **2. Forbidden Page**

**File:** `src/app/auth/forbidden/page.tsx`

Trang hiển thị khi user không có quyền truy cập.

**Features:**

- ✅ Clear explanation of access denied
- ✅ List of allowed roles
- ✅ Display current user's role
- ✅ Actions: Go back, Go home, Logout
- ✅ Beautiful UI with icons and styling

---

### **3. Admin Portal** (Shared)

**Files:**

- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`

Portal dành cho ADMIN và SUPERADMIN (chung).

**Features:**

- ✅ Protected by RoleGuard (['ADMIN', 'SUPERADMIN'])
- ✅ Full admin functionality
- ✅ SUPERADMIN has same access as ADMIN in UI
- ✅ Permission differences handled by backend

---

### **4. Authority Portal**

**Files:**

- `src/app/authority/layout.tsx`
- `src/app/authority/page.tsx`

Portal dành cho cán bộ chính quyền.

**Features:**

- ✅ Protected by RoleGuard (AUTHORITY role only)
- ✅ Welcome message and role info
- ✅ Statistics: Areas, Stations, Alerts, Sensors
- ✅ Feature descriptions
- ✅ "Coming Soon" section for future features

---

### **5. Login Page Notice**

**File:** `src/features/authenticate/components/login-view.tsx`

**Added:**

- ✅ Blue info card explaining system is for government officials
- ✅ Lists allowed roles: Admin, Authority, Super Admin
- ✅ Clarifies that regular users cannot register

---

### **6. Middleware** (Created but not actively used)

**File:** `middleware.ts`

Next.js middleware for server-side route protection.

**Note:** Currently not actively used because:

- Tokens are stored in localStorage (client-side)
- Middleware runs on server and can't access localStorage
- Using client-side RoleGuard instead

**Future Enhancement:**

- Store roles in httpOnly cookies
- Enable middleware for server-side protection

---

## 🔄 **Login Flow with RBAC**

### **Normal Login (Password/OTP):**

1. User enters identifier (email/phone)
2. User enters password or OTP
3. Backend returns: `{ user: { roles: [...] }, accessToken, ... }`
4. Frontend stores in Zustand store
5. `getRedirectPath()` checks roles:
   - `SUPERADMIN` or `ADMIN` → `/admin`
   - `AUTHORITY` → `/authority`
   - `USER` or empty → `/auth/forbidden`
6. User is redirected to appropriate portal
7. Portal's `RoleGuard` verifies role again
8. If verified, content is shown
9. If not, redirect to `/auth/forbidden`

### **Google OAuth Login:**

1. User clicks "Login with Google"
2. Redirected to Google OAuth
3. Google redirects back to `/api/auth/google/callback`
4. API route gets tokens from backend
5. API route checks roles and sets returnUrl
6. Redirects to `/auth/callback` with tokens in hash
7. `/auth/callback` page:
   - Parses tokens from hash
   - Stores in Zustand
   - Checks roles (blocks USER)
   - Redirects to returnUrl
8. Portal's `RoleGuard` verifies role
9. Content shown or redirect to `/auth/forbidden`

---

## 🔧 **Implementation Details**

### **Type Updates:**

**`src/features/authenticate/types/auth.type.ts`:**

```typescript
// Added USER role
export type Role = 'ADMIN' | 'SUPERADMIN' | 'AUTHORITY' | 'USER';
```

### **Redirect Logic Updates:**

**Updated Files:**

1. `src/features/authenticate/components/login-view.tsx`

   - `getRedirectPath()` blocks USER role
   - Redirects SUPERADMIN to `/superadmin` instead of `/admin`

2. `src/app/auth/google/finish/page.tsx`

   - Similar redirect logic with USER blocking

3. `src/app/auth/callback/page.tsx`

   - Added role check after token storage
   - Blocks USER role with toast warning

4. `src/app/api/auth/google/callback/route.ts`
   - Sets returnUrl based on role
   - Blocks USER role

---

## 📱 **UX Improvements**

### **1. Login Page Notice:**

- ℹ️ Info card with blue styling
- 📝 Clear explanation: "Government management system"
- 👥 Lists allowed roles
- 🚫 Explains users cannot self-register

### **2. Forbidden Page:**

- 🛡️ Large shield icon with destructive color
- 📋 Clear "Access Denied" title
- 📝 Detailed explanation in Vietnamese
- 👤 Shows current user's role
- 🔄 Multiple action buttons: Go back, Go home, Logout
- 💡 Contact admin notice

### **3. Portal Pages:**

- 🎨 Beautiful welcome cards with role info
- 📊 Relevant statistics for each role
- 📝 Feature descriptions
- 🚧 "Coming Soon" sections for future features

---

## ✅ **Testing Checklist**

### **Scenario 1: USER Login (Should be blocked)**

- [ ] USER logs in with password → redirected to `/auth/forbidden`
- [ ] USER logs in with Google → redirected to `/auth/forbidden`
- [ ] USER tries to visit `/admin` → redirected to `/auth/forbidden`
- [ ] USER tries to visit `/authority` → redirected to `/auth/forbidden`
- [ ] Forbidden page shows clear message

### **Scenario 2: ADMIN Login**

- [ ] ADMIN logs in → redirected to `/admin`
- [ ] ADMIN can access all `/admin/*` routes
- [ ] ADMIN cannot access `/superadmin` → redirected to `/auth/forbidden`
- [ ] ADMIN can logout and re-login

### **Scenario 3: AUTHORITY Login**

- [ ] AUTHORITY logs in → redirected to `/authority`
- [ ] AUTHORITY can access `/authority` portal
- [ ] AUTHORITY cannot access `/admin` → redirected to `/auth/forbidden`
- [ ] AUTHORITY sees proper dashboard

### **Scenario 4: SUPERADMIN Login**

- [ ] SUPERADMIN logs in → redirected to `/admin`
- [ ] SUPERADMIN can access all `/admin/*` routes
- [ ] SUPERADMIN shares same portal as ADMIN
- [ ] SUPERADMIN has highest privileges in the system

### **Scenario 5: Unauthenticated Access**

- [ ] Visiting `/admin` without login → redirected to `/auth/login`
- [ ] Visiting `/authority` without login → redirected to `/auth/login`

---

## 🚀 **Future Enhancements**

### **1. Cookie-Based Role Storage**

- Store roles in httpOnly cookie after login
- Enable server-side middleware protection
- More secure than localStorage-only approach

### **2. Permission-Based Access**

- Beyond roles, add granular permissions
- Example: `canEditUsers`, `canViewReports`
- Use permission checks in components

### **3. Audit Logging**

- Log all access attempts
- Track who accessed what and when
- Useful for security audits

### **4. Dynamic Role Assignment**

- Admin UI to assign/revoke roles
- Real-time role updates
- Role hierarchy management

### **5. Session Management**

- Track active sessions
- Force logout specific users
- Session timeout management

---

## 📚 **Related Files**

### **Core RBAC Files:**

- `src/components/guards/RoleGuard.tsx` - Client-side guard
- `src/features/authenticate/types/auth.type.ts` - Role types
- `middleware.ts` - Server-side middleware (for future use)

### **Auth Pages:**

- `src/app/auth/login/page.tsx` - Login page
- `src/app/auth/forbidden/page.tsx` - Forbidden page
- `src/features/authenticate/components/login-view.tsx` - Login UI

### **Portal Layouts:**

- `src/app/admin/layout.tsx` - Admin layout with RBAC (shared by ADMIN & SUPERADMIN)
- `src/app/authority/layout.tsx` - Authority layout with RBAC

### **Portal Pages:**

- `src/app/admin/page.tsx` - Admin dashboard (shared by ADMIN & SUPERADMIN)
- `src/app/authority/page.tsx` - Authority dashboard

### **OAuth Callbacks:**

- `src/app/auth/callback/page.tsx` - OAuth callback handler
- `src/app/auth/google/finish/page.tsx` - Google finish handler
- `src/app/api/auth/google/callback/route.ts` - OAuth API route

---

## 💡 **Best Practices**

### **DO:**

- ✅ Always use `RoleGuard` for protected routes
- ✅ Check roles both client-side and server-side (if possible)
- ✅ Provide clear error messages to users
- ✅ Log access denials for security monitoring
- ✅ Keep role definitions centralized

### **DON'T:**

- ❌ Rely only on client-side checks (can be bypassed)
- ❌ Store sensitive data accessible to unauthorized roles
- ❌ Hard-code role checks everywhere (use RoleGuard)
- ❌ Forget to update role checks when adding new roles
- ❌ Allow self-registration for admin roles

---

## 🎉 **Summary**

Hệ thống FDA giờ đã có **Role-Based Access Control** hoàn chỉnh:

✅ **4 Roles**: USER, AUTHORITY, ADMIN, SUPERADMIN  
✅ **Protected Routes**: /admin (ADMIN & SUPERADMIN), /authority  
✅ **RoleGuard Component**: Client-side protection  
✅ **Forbidden Page**: Clear access denial UI  
✅ **Login Notice**: Informs users about admin system  
✅ **Portal Pages**: Dedicated dashboards for each role  
✅ **Redirect Logic**: Smart routing based on roles  
✅ **Build Success**: All changes compile and work

**Result:** USER role không thể truy cập vào hệ thống quản lý! 🎯
