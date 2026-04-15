'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  MessageSquareWarning,
  History,
  BellRing,
  Map as MapIcon,
  Droplets,
  SmartphoneNfc,
  Newspaper,
  ChevronDown,
  Wallet,
  ServerCog
} from 'lucide-react';

import { useAppStore } from '@/libs/store';
import { cn } from '@/libs/utils';

type NavLink = {
  type: 'link';
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
};

type NavGroup = {
  type: 'group';
  label: string;
  icon: React.ElementType;
  children: Omit<NavLink, 'type'>[];
};

type NavItem = NavLink | NavGroup;

const navItemsAdmin: NavItem[] = [
  {
    type: 'link',
    label: 'Bảng điều khiển',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true
  },
  {
    type: 'link',
    label: 'Lịch sử ngập',
    href: '/admin/flood-history',
    icon: History
  },
  {
    type: 'link',
    label: 'Người dùng & vai trò',
    href: '/admin/users',
    icon: Users
  },
  {
    type: 'group',
    label: 'Thanh toán & gói',
    icon: Wallet,
    children: [
      {
        label: 'Gói đăng ký',
        href: '/admin/plan-subscriptions',
        icon: CreditCard
      },
      {
        label: 'Khiếu nại gói',
        href: '/admin/subscription-disputes',
        icon: MessageSquareWarning
      },
      {
        label: 'Giao dịch thanh toán',
        href: '/admin/billing-payment',
        icon: Receipt
      }
    ]
  },
  {
    type: 'link',
    label: 'Trạm quan trắc',
    href: '/admin/stations',
    icon: SmartphoneNfc
  },
  {
    type: 'group',
    label: 'Cảnh báo & tin',
    icon: BellRing,
    children: [
      {
        label: 'Mẫu cảnh báo',
        href: '/admin/alerts',
        icon: BellRing
      },
      {
        label: 'Tin tức',
        href: '/admin/news',
        icon: Newspaper
      }
    ]
  },
  { type: 'link', label: 'Bản đồ & vùng', href: '/admin/zones', icon: MapIcon },
  {
    type: 'link',
    label: 'Tác vụ',
    href: '/admin/tasks',
    icon: ServerCog
  }
];

const navItemsModerator: NavItem[] = [
  {
    type: 'link',
    label: 'Bảng điều khiển',
    href: '/moderator',
    icon: LayoutDashboard,
    exact: true
  },
  {
    type: 'link',
    label: 'Lịch sử ngập',
    href: '/moderator/flood-history',
    icon: History
  },
  {
    type: 'link',
    label: 'Trạm quan trắc',
    href: '/moderator/stations',
    icon: SmartphoneNfc
  },
  {
    type: 'group',
    label: 'Cảnh báo & tin',
    icon: BellRing,
    children: [
      {
        label: 'Mẫu cảnh báo',
        href: '/moderator/alerts',
        icon: BellRing
      },
      {
        label: 'Tin tức',
        href: '/moderator/news',
        icon: Newspaper
      }
    ]
  },
  {
    type: 'link',
    label: 'Bản đồ & vùng',
    href: '/moderator/zones',
    icon: MapIcon
  },
  {
    type: 'link',
    label: 'Tác vụ',
    href: '/moderator/tasks',
    icon: ServerCog
  }
];

function isGroupActive(group: NavGroup, pathname: string) {
  return group.children.some((c) => pathname.startsWith(c.href));
}

export const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useAppStore();
  const pathname = usePathname();
  const isModeratorPortal = pathname.startsWith('/moderator');
  const navItems = isModeratorPortal ? navItemsModerator : navItemsAdmin;
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const item of navItems) {
      if (item.type === 'group' && isGroupActive(item, pathname)) {
        initial.add(item.label);
      }
    }
    return initial;
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  useEffect(() => {
    const handleResize = () => {};
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    if (!isDesktop && isSidebarOpen) {
      toggleSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Auto-open groups when navigating into them
  useEffect(() => {
    for (const item of navItems) {
      if (item.type === 'group' && isGroupActive(item, pathname)) {
        setOpenGroups((prev) => {
          if (prev.has(item.label)) return prev;
          return new Set(prev).add(item.label);
        });
      }
    }
  }, [pathname]);

  const renderLink = (item: Omit<NavLink, 'type'>, indent = false) => {
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
          !isSidebarOpen && 'lg:justify-center lg:px-0',
          indent && isSidebarOpen && 'pl-10'
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
  };

  const renderGroup = (group: NavGroup) => {
    const isOpen = openGroups.has(group.label);
    const groupActive = isGroupActive(group, pathname);

    return (
      <div key={group.label}>
        <button
          type='button'
          onClick={() => toggleGroup(group.label)}
          title={!isSidebarOpen ? group.label : undefined}
          className={cn(
            'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
            groupActive
              ? 'text-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            !isSidebarOpen && 'lg:justify-center lg:px-0'
          )}
        >
          <group.icon
            className={cn(
              'flex-shrink-0 transition-all duration-200',
              !isSidebarOpen ? 'h-5 w-5 lg:h-5 lg:w-5' : 'h-5 w-5'
            )}
          />
          <span
            className={cn(
              'flex-1 truncate text-left transition-all duration-300',
              !isSidebarOpen && 'lg:hidden'
            )}
          >
            {group.label}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 flex-shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180',
              !isSidebarOpen && 'lg:hidden'
            )}
          />
        </button>

        {/* Children — only visible when expanded and sidebar open */}
        {isOpen && isSidebarOpen && (
          <div className='mt-1 space-y-0.5'>
            {group.children.map((child) => renderLink(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className='fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] lg:hidden'
          onClick={toggleSidebar}
          aria-hidden='true'
        />
      )}

      <aside
        className={cn(
          'bg-card fixed top-0 left-0 z-40 flex h-screen flex-col border-r transition-all duration-300 ease-in-out',
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
              {isModeratorPortal ? 'FDA Moderator' : 'FDA Admin'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className={cn(
            'scrollbar-hide flex-1 overflow-y-auto',
            isSidebarOpen ? 'space-y-1 p-3' : 'space-y-1 p-2 lg:p-2'
          )}
        >
          {navItems.map((item) =>
            item.type === 'group' ? renderGroup(item) : renderLink(item)
          )}
        </nav>

        {/* Status box */}
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
