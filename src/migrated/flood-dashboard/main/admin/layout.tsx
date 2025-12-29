// 'use client';

// import React, { useEffect } from 'react';
// import { Sidebar } from '@/migrated/flood-dashboard/components/layout/Sidebar';
// import { Header } from '@/migrated/flood-dashboard/components/layout/Header';
// import { useAppStore } from '@/migrated/flood-dashboard/lib/store';
// import { cn } from '@/migrated/flood-dashboard/lib/utils';
// // NOTE: tạm thời không route protection bằng router custom ở giai đoạn test
// // import { useRouter } from '@/migrated/flood-dashboard/lib/router';

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   const { isSidebarOpen, theme, isAuthenticated } = useAppStore();
//   // const router = useRouter();

//   useEffect(() => {
//     // Basic route protection (tạm tắt khi test migration)
//     // if (!isAuthenticated) router.push('/auth/login');
//   }, [isAuthenticated]);

//   useEffect(() => {
//     const root = window.document.documentElement;
//     root.classList.remove('light', 'dark');
//     root.classList.add(theme);
//   }, [theme]);

//   return (
//     <div className="min-h-screen bg-background text-foreground flex">
//       <Sidebar />
//       <div
//         className={cn(
//           'flex flex-col flex-1 transition-all duration-300',
//           isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
//         )}
//       >
//         <Header />
//         <main className="flex-1 p-6 overflow-auto">{children}</main>
//       </div>
//     </div>
//   );
// }


'use client';

import React, { useEffect } from 'react';
import { Sidebar } from '@/migrated/flood-dashboard/components/layout/Sidebar';
import { Header } from '@/migrated/flood-dashboard/components/layout/Header';
import { useAppStore } from '@/migrated/flood-dashboard/lib/store';
import { cn } from '@/migrated/flood-dashboard/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, theme } = useAppStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    // 🔥 đổi min-h-screen -> h-screen để có "khung chiều cao" cố định cho scroll nội bộ
    <div className="h-screen bg-background text-foreground flex">
      <Sidebar />

      {/* 🔥 min-h-0 để flex con được phép shrink và tạo scroll */}
      <div
        className={cn(
          'flex min-h-0 flex-col flex-1 transition-all duration-300',
          isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        )}
      >
        <Header />

        {/* 🔥 min-h-0 + overflow-y-auto */}
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
