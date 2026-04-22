'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import {
  clearAuthSessionCookies,
  setAuthSessionCookies
} from '@/helpers/auth-session';
import { useAuthRefresh } from '@/hooks/use-auth-refresh';

export default function AuthSessionBridge() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  useAuthRefresh();

  useEffect(() => {
    if (status === 'authenticated' && user?.roles?.length) {
      setAuthSessionCookies(user.roles);
      return;
    }

    if (status === 'unauthenticated') {
      clearAuthSessionCookies();
    }
  }, [status, user]);

  return null;
}
