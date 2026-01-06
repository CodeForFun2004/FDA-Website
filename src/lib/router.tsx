'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter as useNextRouter } from 'next/navigation';

// Mimic a small subset of router used by migrated UI
export const useRouter = () => {
  const router = useNextRouter();
  const pathname = usePathname();

  return {
    push: (href: string) => router.push(href),
    replace: (href: string) => router.replace(href),
    back: () => router.back(),
    pathname
  };
};

// Mimic react-router Link as RouterLink
export const RouterLink = ({
  to,
  href,
  children,
  ...rest
}: {
  to?: string;
  href?: string;
  children: React.ReactNode;
} & React.ComponentProps<typeof Link>) => {
  const finalHref = href ?? to ?? '#';
  return (
    <Link href={finalHref} {...rest}>
      {children}
    </Link>
  );
};

