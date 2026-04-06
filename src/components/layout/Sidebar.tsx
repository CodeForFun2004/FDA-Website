'use client';

import React, { useEffect } from 'react';
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
  SmartphoneNfc,
  Newspaper
} from 'lucide-react';

import { useAppStore } from '@/libs/store';
import { cn } from '@/libs/utils';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  {
    label: 'Flood History',
    href: '/admin/flood-history',
    icon: LayoutDashboard
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: LayoutDashboard
  },
  { label: 'Users & Roles', href: '/admin/users', icon: Users },
  { label: 'Stations', href: '/admin/stations', icon: SmartphoneNfc },
  { label: 'IoT Devices', href: '/admin/devices', icon: Radio },
  { label: 'Sensors Data', href: '/admin/sensors', icon: Activity },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: MapPinCheck },
  { label: 'Areas', href: '/admin/areas', icon: MapPinCheck },
  { label: 'Alerts Template', href: '/admin/alerts', icon: AlertTriangle },
  { label: 'News & Updates', href: '/admin/news', icon: Newspaper },
  {
    label: 'Alert Subscriptions',
    href: '/admin/user-alert-subscription',
    icon: AlertTriangle
  },
  { label: 'Safe Routes', href: '/admin/routes', icon: Waypoints },
  { label: 'Map & Zones', href: '/admin/zones', icon: MapIcon },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Logs & Audit', href: '/admin/logs', icon: FileText }
];

export const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useAppStore();
  const pathname = usePathname();

  // Auto-close sidebar on mobile when navigating to a new page
  useEffect(() => {
    const handleResize = () => {
      // If viewport >= lg (1024px) and sidebar is closed, that's icon mode — no action needed
      // If viewport < lg (mobile/tablet) and sidebar is open, close it on route change
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    if (!isDesktop && isSidebarOpen) {
      toggleSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Backdrop overlay — only visible on mobile/tablet when sidebar is open */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] lg:hidden'
          onClick={toggleSidebar}
          aria-hidden='true'
        />
      )}

      <aside
        className={cn(
          // Base: fixed, full height, transition
          'bg-card fixed top-0 left-0 z-40 flex h-screen flex-col border-r transition-all duration-300 ease-in-out',
          // Mobile/tablet: slide in/out as overlay (always w-64)
          // Desktop (lg+): always visible, collapsed = w-16, expanded = w-64
          isSidebarOpen
            ? 'w-64 translate-x-0'
            : 'w-64 -translate-x-full lg:w-16 lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className='flex h-16 flex-shrink-0 items-center justify-center px-3'>
          <div className='text-primary flex items-center gap-3 overflow-hidden text-xl font-bold'>
            <div className='bg-primary/10 flex-shrink-0 rounded-xl p-2'>
              <Droplets className='text-primary h-6 w-6' />
            </div>
            <span
              className={cn(
                'whitespace-nowrap transition-all duration-300',
                !isSidebarOpen && 'lg:w-0 lg:overflow-hidden lg:opacity-0'
              )}
            >
              FDA Admin
            </span>
          </div>
        </div>

        {/* Navigation - Scrollable with hidden scrollbar */}
        <nav
          className={cn(
            'scrollbar-hide flex-1 overflow-y-auto',
            isSidebarOpen ? 'space-y-1 p-3' : 'space-y-1 p-2 lg:p-2'
          )}
        >
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isSidebarOpen ? item.label : undefined}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-primary/20 shadow-md'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  // Desktop collapsed: center icons
                  !isSidebarOpen && 'lg:justify-center lg:px-0'
                )}
              >
                <item.icon
                  className={cn(
                    'flex-shrink-0 transition-all duration-200',
                    !isSidebarOpen ? 'h-5 w-5 lg:h-5 lg:w-5' : 'h-5 w-5'
                  )}
                />
                <span
                  className={cn(
                    'truncate transition-all duration-300',
                    !isSidebarOpen && 'lg:hidden'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Status box - Fixed at bottom */}
        <div
          className={cn(
            'flex-shrink-0 transition-all',
            isSidebarOpen ? 'p-3' : 'p-3 lg:px-2'
          )}
        >
          <div
            title={
              !isSidebarOpen ? 'System Status: Monitoring Active' : undefined
            }
            className={cn(
              'flex items-center overflow-hidden rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 transition-all dark:border-blue-900/50 dark:from-blue-950/30 dark:to-indigo-950/30',
              isSidebarOpen
                ? 'gap-1.5 p-2.5'
                : 'justify-start gap-1.5 p-2.5 lg:justify-center'
            )}
          >
            <div className='flex flex-shrink-0 items-center gap-1.5'>
              <span className='relative flex h-2 w-2'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75'></span>
                <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-500'></span>
              </span>
            </div>
            <div
              className={cn(
                'flex flex-col transition-all duration-300',
                !isSidebarOpen && 'lg:hidden'
              )}
            >
              <p className='text-[10px] font-semibold whitespace-nowrap text-blue-800 dark:text-blue-300'>
                System Status
              </p>
              <span className='text-muted-foreground text-[10px] whitespace-nowrap'>
                Monitoring Active
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
