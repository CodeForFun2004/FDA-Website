// import React from 'react';
// import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';

// // Mimic next/navigation useRouter
// export const useRouter = () => {
//   const navigate = useNavigate();
//   return {
//     push: (path: string) => navigate(path),
//     replace: (path: string) => navigate(path, { replace: true }),
//     back: () => navigate(-1),
//     forward: () => navigate(1),
//     refresh: () => window.location.reload(),
//   };
// };

// // Mimic next/navigation usePathname
// export const usePathname = () => {
//   const location = useLocation();
//   return location.pathname;
// };

// // Mimic next/link
// export const Link = ({ href, children, className, ...props }: any) => {
//   return (
//     <RouterLink to={href} className={className} {...props}>
//       {children}
//     </RouterLink>
//   );
// };

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

