'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ResetPasswordGuard from '@/features/authenticate/components/reset-password-guard';

export default function ReactQueryProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {/* Reset Password Modal Guard - shows modal after OTP login if needed */}
      <ResetPasswordGuard />
    </QueryClientProvider>
  );
}
