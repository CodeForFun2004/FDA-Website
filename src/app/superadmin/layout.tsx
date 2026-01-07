import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminShell from '@/features/admin/components/AdminShell';
import AdminProviders from '../admin/providers';

export const metadata: Metadata = {
  title: 'FDA Super Admin',
  description: 'Super Admin UI'
};

export default async function SuperAdminLayout({
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
      <AdminShell>{children}</AdminShell>
    </AdminProviders>
  );
}
