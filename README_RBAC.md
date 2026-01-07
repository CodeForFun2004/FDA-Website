# RBAC Implementation Guide

## Overview

This application implements **Role-Based Access Control (RBAC)** with a centralized middleware approach for managing user permissions across different routes.

## Roles

The system supports 3 roles with hierarchical permissions:

1. **SUPER_ADMIN** (Level 3) - Full system access
2. **ADMIN** (Level 2) - Administrative access
3. **AUTHORITY** (Level 1) - Authority-specific access

> **Note**: VIEWER role has been removed. Users without proper roles cannot access any protected routes.

## Route Structure

```
/admin/*       → SUPER_ADMIN, ADMIN
/superadmin/*  → SUPER_ADMIN only
/authority/*   → SUPER_ADMIN, AUTHORITY
/auth/*        → Public (no auth required)
```

## Key Files

### 1. `middleware.ts` (Root Level)
- **Purpose**: Centralized authentication and authorization
- **Responsibilities**:
  - Check if user is authenticated
  - Verify JWT token
  - Check role permissions
  - Redirect unauthorized users

### 2. `src/config/permissions.ts`
- **Purpose**: Permission matrix configuration
- **Contains**:
  - Role definitions
  - Route permissions mapping
  - Helper functions for permission checks

### 3. `src/lib/auth-utils.ts`
- **Purpose**: JWT token utilities
- **Functions**:
  - `verifyToken()` - Verify and decode JWT
  - `createToken()` - Create new JWT (backend use)
  - `decodeToken()` - Decode without verification

## How It Works

### Request Flow

```
1. User requests /admin/dashboard
   ↓
2. Middleware intercepts request
   ↓
3. Check if route requires auth (from permissions.ts)
   ↓
4. Get token from cookie 'fda_session'
   ↓
5. Verify token and extract user roles
   ↓
6. Check if user roles match allowed roles
   ↓
7. Allow/Deny access
```

### Adding New Protected Routes

1. **Update `src/config/permissions.ts`**:

```typescript
export const ROUTE_PERMISSIONS: RoutePermissions[] = [
  // ... existing routes
  {
    path: '/new-route',
    allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    requireAuth: true
  }
];
```

2. **Update `middleware.ts` matcher**:

```typescript
export const config = {
  matcher: [
    '/admin/:path*',
    '/superadmin/:path*',
    '/new-route/:path*', // Add here
  ]
};
```

3. **Create the route** in `src/app/new-route/`

That's it! The middleware will automatically protect it.

## Adding New Roles

1. **Update role type** in `src/config/permissions.ts`:

```typescript
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'AUTHORITY' | 'VIEWER' | 'NEW_ROLE';
```

2. **Update role hierarchy**:

```typescript
export const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 5,
  NEW_ROLE: 4,
  ADMIN: 3,
  AUTHORITY: 2,
  VIEWER: 1
};
```

3. **Add to permission matrix**:

```typescript
{
  path: '/new-role-route',
  allowedRoles: ['NEW_ROLE', 'SUPER_ADMIN'],
  requireAuth: true
}
```

## Environment Variables

Required in `.env.local`:

```env
JWT_SECRET=your-super-secret-key-change-in-production
```

## Testing

### Manual Testing

1. **Test unauthenticated access**:
   - Navigate to `/admin/dashboard` without login
   - Should redirect to `/auth/login`

2. **Test role permissions**:
   - Login as VIEWER
   - Try to access `/admin/dashboard`
   - Should redirect to `/auth/forbidden`

3. **Test valid access**:
   - Login as ADMIN
   - Access `/admin/dashboard`
   - Should work normally

### Automated Testing

```typescript
// Example test
describe('RBAC Middleware', () => {
  it('should allow ADMIN to access /admin', async () => {
    const response = await middleware(mockRequest('/admin', ['ADMIN']));
    expect(response.status).toBe(200);
  });

  it('should deny VIEWER from /admin', async () => {
    const response = await middleware(mockRequest('/admin', ['VIEWER']));
    expect(response.status).toBe(307); // redirect
  });
});
```

## Security Best Practices

1. ✅ **Always use HTTPS** in production
2. ✅ **Rotate JWT secrets** regularly
3. ✅ **Set appropriate token expiration** (currently 7 days)
4. ✅ **Validate tokens on backend** for sensitive operations
5. ✅ **Log access attempts** for security auditing
6. ✅ **Use environment variables** for secrets

## Troubleshooting

### Issue: "Access Denied" for valid user

**Solution**: Check if:
1. User's role is included in `allowedRoles` for that route
2. Token is valid and not expired
3. Cookie name matches (`fda_session`)

### Issue: Middleware not running

**Solution**: Verify:
1. `middleware.ts` is at root level (not in `src/`)
2. Route is included in `config.matcher`
3. Next.js dev server was restarted

### Issue: Token verification fails

**Solution**: Ensure:
1. `JWT_SECRET` is set in environment
2. Token format is correct (JWT)
3. Token hasn't expired

## Migration from Old System

If migrating from per-layout auth checks:

1. ✅ Create `middleware.ts` with RBAC logic
2. ✅ Remove auth checks from individual layouts
3. ✅ Test all protected routes
4. ✅ Update documentation

## Support

For questions or issues, contact the development team or refer to:
- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [JWT.io](https://jwt.io/) for token debugging
