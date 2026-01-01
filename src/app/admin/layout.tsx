import type { Metadata } from 'next';
import AdminShell from '@/features/admin/AdminShell';
import AdminProviders from './providers';


export const metadata: Metadata = {
  title: 'FDA Admin',
  description: 'Admin UI'
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <AdminShell>{children}</AdminShell>
    </AdminProviders>
  );
}
