'use client';

import type { ReactNode } from 'react';

import { RoleGuard } from '@/components/guards/RoleGuard';

export default function AdminUsersLayout({
  children
}: {
  children: ReactNode;
}) {
  return <RoleGuard requiredRoles={['SUPERADMIN']}>{children}</RoleGuard>;
}
