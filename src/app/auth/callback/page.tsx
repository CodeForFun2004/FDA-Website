'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from '@/lib/router';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import { setSessionCookie } from '@/helpers/auth-session';

function safeDecode(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

// Chặn open-redirect: chỉ cho phép path nội bộ dạng "/..."
function getSafeReturnUrl(raw: string | null) {
  const fallback = '/admin';
  if (!raw) return fallback;

  const decoded = safeDecode(raw).trim();
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return fallback;

  return decoded;
}

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // ✅ chặn chạy nhiều lần (dev/preload)
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    // Parse URL fragment: #access_token=xxx&refresh_token=yyy&return_url=/admin
    const hash = window.location.hash?.startsWith('#')
      ? window.location.hash.slice(1)
      : '';

    const params = new URLSearchParams(hash);

    let user: any = null;
    const userRaw = params.get('user');
    if (userRaw) {
      try {
        user = JSON.parse(safeDecode(userRaw));
      } catch {
        user = null;
      }
    }

    // Ưu tiên lấy từ hash; nếu hash rỗng thì fallback từ localStorage
    const accessToken =
      params.get('access_token') ??
      params.get('accessToken') ??
      localStorage.getItem('accessToken') ??
      localStorage.getItem('access_token') ??
      '';

    const refreshToken =
      params.get('refresh_token') ??
      params.get('refreshToken') ??
      localStorage.getItem('refreshToken') ??
      localStorage.getItem('refresh_token') ??
      '';

    // ✅ Parse expiresAt from hash
    const expiresAt = params.get('expires_at') ?? params.get('expiresAt') ?? '';

    const returnUrl = getSafeReturnUrl(
      params.get('return_url') ?? params.get('returnUrl')
    );

    if (!accessToken || !refreshToken) {
      const msg = 'Missing access_token/refresh_token from callback.';
      setError(msg);
      toast.error('Google login failed.');
      router.replace('/auth/login?error=oauth_failed');
      return;
    }

    try {
      // Lưu tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      // ✅ HYDRATE zustand store với expiresAt
      useAuthStore.setState(
        (prev: any) => ({
          ...prev,
          status: 'authenticated',
          accessToken,
          refreshToken,
          expiresAt: expiresAt || null, // ✅ Include expiresAt
          user
        }),
        false
      );

      // ✅ Set session cookie để layout có thể check
      setSessionCookie();

      // Xoá hash khỏi URL để sạch (tránh lưu token trong history)
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );

      toast.success('Đăng nhập Google thành công!');
      window.location.replace(returnUrl);
    } catch (e: any) {
      const msg = e?.message ?? 'Failed to persist tokens.';
      setError(msg);
      toast.error('Google login failed.');
      router.replace('/auth/login?error=oauth_failed');
    }
  }, [router]);

  return (
    <div className='flex min-h-[60vh] items-center justify-center px-4'>
      <div className='bg-background w-full max-w-md rounded-2xl border p-6'>
        <h1 className='text-lg font-semibold'>Signing you in…</h1>
        <p className='text-muted-foreground mt-2 text-sm'>
          Please wait while we complete Google authentication.
        </p>

        {error && (
          <div className='border-destructive/30 bg-destructive/10 mt-4 rounded-xl border p-3 text-sm'>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
