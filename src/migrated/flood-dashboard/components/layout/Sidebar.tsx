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
  Settings,
  FileText,
  Waypoints,
  Droplets
} from 'lucide-react';

import { useAppStore } from '@/migrated/flood-dashboard/lib/store';
import { cn } from '@/migrated/flood-dashboard/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Users & Roles', href: '/admin/users', icon: Users },
  { label: 'IoT Devices', href: '/admin/devices', icon: Radio },
  { label: 'Sensors Data', href: '/admin/sensors', icon: Activity },
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
        'fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300 ease-in-out lg:translate-x-0',
        isSidebarOpen
          ? 'w-64 translate-x-0'
          : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'
      )}
    >
      {/* Logo */}
      <div className="flex h-20 items-center justify-center px-4 mb-2">
        <div className="flex items-center gap-3 font-bold text-xl text-primary">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Droplets className="h-6 w-6 text-primary" />
          </div>
          <span className={cn('transition-all', !isSidebarOpen && 'lg:hidden')}>
            FDA Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1.5 p-4">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-muted',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-muted-foreground',
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

      {/* Status box */}
      <div className="absolute bottom-6 left-0 w-full px-6">
        <div
          className={cn(
            'rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border border-blue-100 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-900/50',
            !isSidebarOpen && 'lg:hidden'
          )}
        >
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
            System Status
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-muted-foreground">
              Monitoring Active
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
