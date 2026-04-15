// src/app/moderator/layout.tsx
import AdminShell from '@/features/admin/components/admin-shell';
import AdminProviders from '../admin/providers';
import { RoleGuard } from '@/components/guards/RoleGuard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Moderator Portal | FDA Management System',
  description: 'Moderator management portal for FDA system'
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
