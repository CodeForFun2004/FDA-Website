'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from '@/lib/router';
import Link from 'next/link';
import { Button, Input } from '../../../components/ui/common';
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

import { toast } from 'sonner';

export default function RegisterViewPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0
    );
  }, [fullName, email, password, confirmPassword]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = fullName.trim();
    const mail = email.trim();

    // ✅ validation bằng toast
    if (!name) {
      toast.warning('Vui lòng nhập họ và tên.', { id: 'register-warning' });
      return;
    }
    if (!mail) {
      toast.warning('Vui lòng nhập email.', { id: 'register-warning' });
      return;
    }
    if (!password) {
      toast.warning('Vui lòng nhập mật khẩu.', { id: 'register-warning' });
      return;
    }
    if (!confirmPassword) {
      toast.warning('Vui lòng nhập xác nhận mật khẩu.', {
        id: 'register-warning'
      });
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.', { id: 'register-error' });
      return;
    }

    setIsLoading(true);

    try {
      // ✅ Backend register chưa có -> không gọi API, không login giả
      toast.info(
        'Chức năng đăng ký hiện chưa mở. Vui lòng liên hệ quản trị để được cấp tài khoản.',
        { id: 'register-info' }
      );

      // UX: chuyển về login
      setTimeout(() => {
        router.push('/authenticate/login');
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    toast.warning(
      'Google Sign-Up hiện chưa được triển khai. Vui lòng đăng nhập bằng Email/Password.',
      { id: 'register-google' }
    );
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold'>Create an account</h1>
        <p className='text-muted-foreground'>
          Enter your information to get started.
        </p>
      </div>

      <form onSubmit={handleRegister} className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium' htmlFor='name'>
            Full name
          </label>
          <div className='relative'>
            <UserIcon className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
            <Input
              id='name'
              type='text'
              placeholder='Your name'
              className='pl-9'
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium' htmlFor='email'>
            Email
          </label>
          <div className='relative'>
            <Mail className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
            <Input
              id='email'
              type='email'
              placeholder='nguyenvana@gmail.com'
              className='pl-9'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete='email'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium' htmlFor='password'>
            Password
          </label>
          <div className='relative'>
            <Lock className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />

            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••'
              className='pr-10 pl-9'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete='new-password'
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

        <div className='space-y-2'>
          <label className='text-sm font-medium' htmlFor='confirmPassword'>
            Confirm password
          </label>
          <div className='relative'>
            <Lock className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />

            <Input
              id='confirmPassword'
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder='••••••••'
              className='pr-10 pl-9'
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete='new-password'
            />

            <button
              type='button'
              onClick={() => setShowConfirmPassword((v) => !v)}
              className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
            >
              {showConfirmPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
        </div>

        <Button
          type='submit'
          className='h-11 w-full'
          disabled={isLoading || !canSubmit}
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Processing...
            </>
          ) : (
            <span className='flex items-center'>
              Sign Up <ArrowRight className='ml-2 h-4 w-4' />
            </span>
          )}
        </Button>

        <Button
          type='button'
          variant='outline'
          className='h-11 w-full'
          onClick={() => router.push('/authenticate/login')}
        >
          Go to Sign In
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
        onClick={handleGoogleRegister}
        disabled={isLoading}
      >
        <img
          src='https://www.gstatic.com/devrel-devsite/prod/ve08add287a6b4bdf8961ab8a1be50bf551be3816cdd70b7cc934114ff3ad5f10/developers/images/touchicon-180-new.png'
          alt='Google'
          className='mr-2 h-6 w-6'
        />
        Google
      </Button>

      <p className='text-muted-foreground text-center text-sm'>
        Already have an account?{' '}
        <Link
          href='/authenticate/login'
          className='text-primary font-semibold hover:underline'
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
