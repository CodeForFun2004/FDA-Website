'use client';

import React, { useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAppStore } from '@/libs/store';
import { cn } from '@/libs/utils';

export default function AdminShell({
  children
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen, theme } = useAppStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <div className='bg-background text-foreground flex h-screen overflow-hidden'>
      <Sidebar />

      {/*
        Content area:
        - Mobile/tablet (< lg): full width, no left padding (sidebar is overlay)
        - Desktop (lg+): push content right based on sidebar state
          - Sidebar open:    lg:pl-64
          - Sidebar closed:  lg:pl-16 (icon-only mode)
      */}
      <div
        className={cn(
          'flex min-h-0 w-full min-w-0 flex-1 flex-col transition-all duration-300',
          isSidebarOpen ? 'lg:pl-64' : 'lg:pl-16'
        )}
      >
        <Header />
        <main className='min-h-0 flex-1 overflow-y-auto'>
          <div className='p-4 md:p-6'>{children}</div>
        </main>
      </div>
    </div>
  );
}
