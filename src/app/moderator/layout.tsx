// src/app/moderator/layout.tsx
import AdminShell from '@/features/admin/components/admin-shell';
import AdminProviders from '../admin/providers';
import { RoleGuard } from '@/components/guards/RoleGuard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Giao diện điều phối cho hệ thống FDA.'
};

export default function ModeratorLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProviders>
      <RoleGuard requiredRoles={['MODERATOR']}>
        <AdminShell>{children}</AdminShell>
      </RoleGuard>
    </AdminProviders>
  );
}
