import type { Metadata } from 'next';
import AdminLayout from '@/migrated/flood-dashboard/main/admin/layout';
import ReactQueryProvider from '@/migrated/flood-dashboard/components/providers';


export const metadata: Metadata = {
  title: 'FDA Admin',
  description: 'Admin UI migrated from flood_dashboard'
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <AdminLayout>{children}</AdminLayout>
    </ReactQueryProvider>
  );
}
