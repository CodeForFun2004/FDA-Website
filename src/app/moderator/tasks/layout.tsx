'use client';

import type { ReactNode } from 'react';

import { RoleGuard } from '@/components/guards/RoleGuard';

export default function ModeratorTasksLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard requiredRoles={['ADMIN', 'SUPERADMIN']}>{children}</RoleGuard>
  );
}
