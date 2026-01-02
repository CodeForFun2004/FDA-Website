'use client';

import React, { useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header'; 
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, theme } = useAppStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <div className="h-screen bg-background text-foreground flex">
      <Sidebar />

      <div
        className={cn(
          'flex min-h-0 flex-col flex-1 transition-all duration-300',
          isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        )}
      >
        <Header />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
