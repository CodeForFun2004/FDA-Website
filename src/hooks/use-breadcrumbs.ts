// src/hooks/use-breadcrumbs.ts
'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export type BreadcrumbItem = {
  title: string;
  link: string;
};

// Map segment names to display titles
const segmentTitles: Record<string, string> = {
  admin: 'Admin',
  auth: 'Authentication',
  users: 'Users',
  devices: 'Devices',
  alerts: 'Alerts',
  sensors: 'Sensors',
  routes: 'Routes',
  zones: 'Zones',
  logs: 'Logs',
  settings: 'Settings',
  login: 'Login',
  register: 'Register',
  callback: 'Callback',
  google: 'Google',
  profile: 'Profile'
};

function formatSegment(segment: string): string {
  // Check if we have a predefined title
  if (segmentTitles[segment]) {
    return segmentTitles[segment];
  }

  // Convert kebab-case or snake_case to Title Case
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Skip leading slash and split into segments
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) {
      return [];
    }

    // Build breadcrumbs from path segments
    const items: BreadcrumbItem[] = [];
    let currentPath = '';

    for (const segment of segments) {
      currentPath += `/${segment}`;
      items.push({
        title: formatSegment(segment),
        link: currentPath
      });
    }

    return items;
  }, [pathname]);

  return breadcrumbs;
}
