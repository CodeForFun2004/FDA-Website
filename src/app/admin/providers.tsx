'use client';

import * as React from 'react';
import AuthSessionBridge from '@/features/authenticate/components/auth-session-bridge';
import ResetPasswordGuard from '@/features/authenticate/components/reset-password-guard';

export default function AdminProviders({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <AuthSessionBridge />
      <ResetPasswordGuard />
    </>
  );
}
