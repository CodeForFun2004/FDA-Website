// src/app/authority/layout.tsx
import AdminShell from '@/features/admin/components/AdminShell';
import AdminProviders from '../admin/providers';
import { RoleGuard } from '@/components/guards/RoleGuard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authority Portal | FDA Management System',
  description: 'Authority management portal for FDA system'
};

export default function AuthorityLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProviders>
      <RoleGuard requiredRoles={['AUTHORITY']}>
        <AdminShell>{children}</AdminShell>
      </RoleGuard>
    </AdminProviders>
  );
}
