'use client';

import { useEffect } from 'react';
import { useRouter } from '@/libs/router';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import {
  getPortalPathFromRoles,
  setAuthSessionCookies
} from '@/helpers/auth-session';

function parseHash() {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;

  const sp = new URLSearchParams(hash);

  const accessToken = sp.get('accessToken');
  const refreshToken = sp.get('refreshToken');
  const expiresAt = sp.get('expiresAt');
  const userRaw = sp.get('user'); // base64/json tuỳ bạn encode

  return { accessToken, refreshToken, expiresAt, userRaw };
}

export default function GoogleFinishPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const { accessToken, refreshToken, expiresAt, userRaw } = parseHash();

      if (!accessToken || !refreshToken || !expiresAt || !userRaw) {
        toast.error('Thiếu dữ liệu phiên đăng nhập từ Google.');
        router.push('/auth/login');
        return;
      }

      const user = JSON.parse(decodeURIComponent(userRaw));
      // normalize avatarUrl null -> undefined nếu bạn muốn
      if (user.avatarUrl === null) user.avatarUrl = undefined;

      // set thẳng vào store
      useAuthStore.getState().setSession({
        user,
        accessToken,
        refreshToken,
        expiresAt
      });

      setAuthSessionCookies(user?.roles ?? []);
      toast.success('Đăng nhập Google thành công!');

      // xoá hash khỏi url (đỡ lộ token)
      window.history.replaceState(null, '', '/auth/google/finish');

      router.push(getPortalPathFromRoles(user?.roles ?? []));
    } catch (e: any) {
      toast.error(e?.message ?? 'Hoàn tất đăng nhập Google thất bại.');
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className='flex min-h-[60vh] items-center justify-center'>
      <div className='rounded-2xl border p-6'>
        Đang hoàn tất đăng nhập Google…
      </div>
    </div>
  );
}
