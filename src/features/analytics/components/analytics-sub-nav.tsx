'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, ServerCog } from 'lucide-react';
import { cn } from '@/libs/utils';

const links = [
  {
    href: '/admin/analytics',
    label: 'Analytics',
    icon: BarChart3,
    match: (path: string) => {
      const p = path.replace(/\/$/, '') || '/';
      return p === '/admin/analytics';
    }
  },
  {
    href: '/admin/analytics/hangfire',
    label: 'Background jobs',
    icon: ServerCog,
    match: (path: string) => path.startsWith('/admin/analytics/hangfire')
  }
] as const;

export function AnalyticsSubNav() {
  const pathname = usePathname() || '';

  return (
    <nav
      className='border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 flex flex-wrap gap-2 border-b px-4 py-3 backdrop-blur md:px-6'
      aria-label='Analytics section'
    >
      {links.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className='h-4 w-4 shrink-0' />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
