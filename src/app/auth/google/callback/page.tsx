'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from '@/lib/router';

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

  // chỉ cho phép relative path bắt đầu bằng "/" và không phải "//"
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return fallback;

  return decoded;
}

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse URL fragment: #access_token=xxx&refresh_token=yyy&return_url=/admin
    const hash = window.location.hash?.startsWith('#')
      ? window.location.hash.slice(1)
      : '';

    const params = new URLSearchParams(hash);

    const accessToken =
      params.get('access_token') ?? params.get('accessToken') ?? '';
    const refreshToken =
      params.get('refresh_token') ?? params.get('refreshToken') ?? '';

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

      // Xoá hash khỏi URL để sạch sẽ
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
