'use client';

import React, { useState } from 'react';
import { useRouter } from '@/migrated/flood-dashboard/lib/router';
import Link from 'next/link';
import { useAppStore } from '@/migrated/flood-dashboard/lib/store';
import { Button, Input } from '@/migrated/flood-dashboard/components/ui/common';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import type { User } from '@/migrated/flood-dashboard/lib/types';
import { setSessionCookie } from '@/helpers/auth-session';

export default function LoginViewPage() {
  const router = useRouter();
  const { login } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API Call
    setTimeout(() => {
      const mockUser: User = {
        id: '1',
        name: 'Admin User',
        email: 'admin@fda.gov',
        role: 'Admin',
        status: 'Active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      login(mockUser);
      setIsLoading(false);
      setSessionCookie(); // mặc định 7 ngày
      router.push('/admin');
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);

    setTimeout(() => {
      const mockUser: User = {
        id: 'g-123',
        name: 'Google User',
        email: 'user@gmail.com',
        role: 'Viewer',
        status: 'Active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      login(mockUser);
      setSessionCookie(); // mặc định 7 ngày
      router.push('/admin');
    }, 1500);
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
              placeholder='nguyenvana@gmail.com'
              className='pl-9'
              required
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
              type='password'
              placeholder='••••••••'
              className='pl-9'
              required
            />
          </div>
        </div>

        <Button type='submit' className='h-11 w-full' disabled={isLoading}>
          {isLoading ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
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
