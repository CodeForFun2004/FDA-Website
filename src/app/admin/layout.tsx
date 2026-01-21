import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminShell from '@/features/admin/components/AdminShell';
import AdminProviders from './providers';
import { RoleGuard } from '@/components/guards/RoleGuard';

export const metadata: Metadata = {
  title: 'FDA Admin',
  description: 'Admin UI'
};

export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check
  const cookieStore = await cookies();
  const session = cookieStore.get('fda_session')?.value;

  // No session cookie → redirect to login
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <AdminProviders>
      <RoleGuard requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
        <AdminShell>{children}</AdminShell>
      </RoleGuard>
    </AdminProviders>
  );
}
