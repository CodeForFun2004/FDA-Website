'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Radio,
  Activity,
  AlertTriangle,
  Map as MapIcon,
  MapPinCheck,
  Settings,
  FileText,
  Waypoints,
  Droplets,
  SmartphoneNfc
} from 'lucide-react';

import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  {
    label: 'Flood History',
    href: '/admin/flood-history',
    icon: LayoutDashboard
  },
  { label: 'Users & Roles', href: '/admin/users', icon: Users },
  { label: 'Stations', href: '/admin/stations', icon: SmartphoneNfc },
  { label: 'IoT Devices', href: '/admin/devices', icon: Radio },
  { label: 'Sensors Data', href: '/admin/sensors', icon: Activity },
  { label: 'Areas', href: '/admin/areas', icon: MapPinCheck },
  { label: 'Flood Alerts', href: '/admin/alerts', icon: AlertTriangle },
  { label: 'Safe Routes', href: '/admin/routes', icon: Waypoints },
  { label: 'Map & Zones', href: '/admin/zones', icon: MapIcon },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Logs & Audit', href: '/admin/logs', icon: FileText }
];

export const Sidebar = () => {
  const { isSidebarOpen } = useAppStore();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'bg-card fixed top-0 left-0 z-40 flex h-screen flex-col border-r transition-all duration-300 ease-in-out lg:translate-x-0',
        isSidebarOpen
          ? 'w-64 translate-x-0'
          : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'
      )}
    >
      {/* Logo */}
      <div className='mb-2 flex h-20 flex-shrink-0 items-center justify-center px-4'>
        <div className='text-primary flex items-center gap-3 text-xl font-bold'>
          <div className='bg-primary/10 rounded-xl p-2'>
            <Droplets className='text-primary h-6 w-6' />
          </div>
          <span className={cn('transition-all', !isSidebarOpen && 'lg:hidden')}>
            FDA Admin
          </span>
        </div>
      </div>

      {/* Navigation - Scrollable with hidden scrollbar */}
      <nav className='scrollbar-hide flex-1 space-y-1.5 overflow-y-auto p-4'>
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-primary/20 shadow-md'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                !isSidebarOpen && 'lg:justify-center lg:px-2'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  !isSidebarOpen && 'lg:h-6 lg:w-6'
                )}
              />
              <span className={cn('truncate', !isSidebarOpen && 'lg:hidden')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Status box - Fixed at bottom (compact) */}
      <div className='flex-shrink-0 p-4'>
        <div
          className={cn(
            'rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-2.5 dark:border-blue-900/50 dark:from-blue-950/30 dark:to-indigo-950/30',
            !isSidebarOpen && 'lg:hidden'
          )}
        >
          <p className='text-[10px] font-semibold text-blue-800 dark:text-blue-300'>
            System Status
          </p>
          <div className='mt-1.5 flex items-center gap-1.5'>
            <span className='relative flex h-2 w-2'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75'></span>
              <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-500'></span>
            </span>
            <span className='text-muted-foreground text-[10px]'>
              Monitoring Active
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
