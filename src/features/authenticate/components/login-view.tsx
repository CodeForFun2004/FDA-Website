// src/features/authenticate/login-view.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from '@/libs/router';
import { Button } from '../../../components/ui/common';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import {
  getPortalPathFromRoles,
  setAuthSessionCookies
} from '@/helpers/auth-session';
import { toast } from 'sonner';
import { initGoogleOAuthApi } from '@/features/authenticate/api/auth.api';
import LoginFlow from './login-flow';

export default function LoginViewPage() {
  const router = useRouter();

  const status = useAuthStore((s) => s.status);
  const clearError = useAuthStore((s) => s.clearError);

  const [googleLoading, setGoogleLoading] = useState(false);
  const disabled = status === 'loading' || googleLoading;

  const getRedirectPath = () => {
    const user = useAuthStore.getState().user;
    return getPortalPathFromRoles(user?.roles ?? []);
  };

  const onLoggedIn = () => {
    const roles = useAuthStore.getState().user?.roles ?? [];
    setAuthSessionCookies(roles);
    router.push(getRedirectPath());
  };

  // const handleGoogleLogin = async () => {
  //   clearError();
  //   setGoogleLoading(true);

  //   try {
  //     const returnUrl = `${window.location.origin}/auth/google/callback`;
  //     console.log("Check Return URL:", returnUrl);

  //     const next = new URLSearchParams(window.location.search).get("next") ?? "";
  //     if (next) sessionStorage.setItem("post_login_redirect", next);

  //     const { authorizationUrl, state } = await initGoogleOAuthApi({ returnUrl });

  //     sessionStorage.setItem("google_oauth_state", state);
  //     window.location.href = authorizationUrl;
  //   } catch (e: any) {
  //     toast.error(e?.message ?? "Không thể bắt đầu Google Sign-In.");
  //   } finally {
  //     setGoogleLoading(false);
  //   }
  // };

  const handleGoogleLogin = async () => {
    clearError();
    setGoogleLoading(true);

    try {
      const next =
        new URLSearchParams(window.location.search).get('next') || '/';

      // returnUrl phải là trang sau login (path nội bộ)
      const returnUrl = next.startsWith('/') ? next : '/dashboard';

      // callback FE theo flow mới
      const callbackUrl = `${window.location.origin}/auth/callback`;

      console.log('callbackUrl:', callbackUrl);
      console.log('returnUrl:', returnUrl);

      // nếu bạn còn dùng post_login_redirect thì ok, nhưng flow mới đã có return_url
      // sessionStorage.setItem("post_login_redirect", returnUrl);

      const { authorizationUrl } = await initGoogleOAuthApi({
        returnUrl,
        callbackUrl // có thể BE không cần, nhưng gửi cũng không hại nếu BE ignore
      });

      window.location.assign(authorizationUrl);
    } catch (e: any) {
      toast.error(e?.message ?? 'Không thể bắt đầu đăng nhập Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold'>Chào mừng quay lại</h1>
        <p className='text-muted-foreground'>
          Nhập email/số điện thoại để đăng nhập bằng OTP hoặc mật khẩu.
        </p>
      </div>

      {/* ✅ Admin System Notice */}
      <div className='rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900/50 dark:bg-blue-950/20'>
        <div className='flex items-start gap-2'>
          <svg
            className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <div className='flex-1 text-sm'>
            <p className='font-medium text-blue-900 dark:text-blue-100'>
              Cổng đăng nhập dành cho cơ quan quản lý
            </p>
            <p className='text-muted-foreground mt-1 text-xs leading-relaxed'>
              Trang này dành cho <strong>Admin</strong>,{' '}
              <strong>Moderator</strong> và <strong>Super Admin</strong>. Người
              dùng thường không thể tự đăng ký. Vui lòng liên hệ quản trị viên
              để được cấp quyền.
            </p>
          </div>
        </div>
      </div>

      <LoginFlow onLoggedIn={onLoggedIn} />

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background text-muted-foreground px-2'>
            Hoặc tiếp tục với
          </span>
        </div>
      </div>

      <Button
        variant='outline'
        type='button'
        className='h-11 w-full'
        onClick={handleGoogleLogin}
        disabled={disabled}
      >
        <img
          src='https://www.gstatic.com/devrel-devsite/prod/ve08add287a6b4bdf8961ab8a1be50bf551be3816cdd70b7cc934114ff3ad5f10/developers/images/touchicon-180-new.png'
          alt='Google'
          className='mr-2 h-6 w-6'
        />
        Google
      </Button>

      {/* <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="text-primary font-semibold hover:underline"
        >
          Sign up
        </Link>
      </p> */}
    </div>
  );
}
