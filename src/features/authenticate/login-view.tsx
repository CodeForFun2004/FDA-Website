'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from '@/lib/router';
import Link from 'next/link';
import { Button, Input } from '../../components/ui/common';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { setSessionCookie } from '@/helpers/auth-session';
import { toast } from 'sonner'; // ✅ FIX BUG: import toast

export default function LoginViewPage() {
  const router = useRouter();

  const loginWithPassword = useAuthStore((s) => s.loginWithPassword);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const disabled = isLoading || status === 'loading';

  // Nếu store có error -> show toast error (đồng bộ)
  // useEffect(() => {
  //   if (error) toast.error(error);
  // }, [error]);

  const getRedirectPath = () => {
    const user = useAuthStore.getState().user;
    const roles = user?.roles ?? [];

    if (roles.includes('SUPER_ADMIN')) return '/admin';
    if (roles.includes('ADMIN')) return '/admin';
    if (roles.includes('AUTHORITY')) return '/authority';
    return '/';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const trimmedEmail = email.trim();

    // ✅ validation toast
    if (!trimmedEmail) {
      toast.warning('Vui lòng nhập email.');
      return;
    }
    if (!password) {
      toast.warning('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithPassword(trimmedEmail, password);

      toast.success('Đăng nhập thành công!');
      setSessionCookie(); // giữ nếu bạn muốn cookie UI marker
      router.push(getRedirectPath());
    } catch (e: any) {
      // Store đã set error; nhưng catch để chắc chắn
      toast.error(e?.message ?? 'Đăng nhập thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    clearError();
    toast.warning(
      'Google Sign-In hiện chưa được triển khai. Vui lòng đăng nhập bằng Email/Password.'
    );
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold'>Welcome Back</h1>
        <p className='text-muted-foreground'>
          Enter your credentials to access the dashboard.
        </p>
      </div>

      <form onSubmit={handleLogin} className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium' htmlFor='email'>
            Email
          </label>
          <div className='relative'>
            <Mail className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
            <Input
              id='email'
              type='email'
              placeholder='you@example.com'
              className='pl-9'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => error && clearError()}
              autoComplete='email'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <label className='text-sm font-medium' htmlFor='password'>
              Password
            </label>
            <Link href='#' className='text-primary text-sm hover:underline'>
              Forgot password?
            </Link>
          </div>
          <div className='relative'>
            <Lock className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />

            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••'
              className='pr-12 pl-9' // chừa thêm khoảng cho nút mắt
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete='current-password'
              data-lpignore='true'
              data-1p-ignore='true'
              data-bwignore='true'
            />

            <button
              type='button'
              onClick={() => setShowPassword((v) => !v)}
              className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
        </div>

        <Button type='submit' className='h-11 w-full' disabled={disabled}>
          {disabled ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Signing in...
            </>
          ) : (
            <span className='flex items-center'>
              Sign In <ArrowRight className='ml-2 h-4 w-4' />
            </span>
          )}
        </Button>
      </form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background text-muted-foreground px-2'>
            Or continue with
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

      <p className='text-muted-foreground text-center text-sm'>
        Don&apos;t have an account?{' '}
        <Link
          href='/authenticate/register'
          className='text-primary font-semibold hover:underline'
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
