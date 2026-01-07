'use client';

import React from 'react';
import { Activity, Droplets, ShieldCheck } from 'lucide-react';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='bg-background flex min-h-screen w-full'>
      {/* Left Side - Visual / Branding */}
      <div className='relative hidden w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500 p-12 text-white lg:flex'>
        {/* Abstract Background Shapes */}
        <div className='absolute top-0 left-0 h-full w-full opacity-10'>
          <svg
            className='h-full w-full'
            viewBox='0 0 100 100'
            preserveAspectRatio='none'
          >
            <path d='M0 100 C 20 0 50 0 100 100 Z' fill='white' />
            <circle cx='90' cy='10' r='20' fill='white' />
          </svg>
        </div>

        <div className='relative z-10 max-w-lg space-y-6 text-center'>
          <div className='mb-8 flex flex-col items-center gap-4'>
            <div className='rounded-2xl bg-white p-6 shadow-xl'>
              <Droplets className='h-12 w-12 text-blue-600' />
            </div>
            <h1 className='text-3xl font-bold tracking-tight'>FDA System</h1>
          </div>

          <h2 className='text-4xl leading-tight font-bold'>
            Hệ thống Giám sát Lũ lụt
          </h2>

          <p className='text-lg text-blue-100'>
            Cập nhật dữ liệu thời gian thực và gợi ý lộ trình an toàn cho cộng
            đồng.
          </p>

          <div className='flex justify-center gap-4 pt-8'>
            <div className='flex w-32 flex-col items-center gap-2 rounded-xl bg-white/10 p-4 backdrop-blur-sm'>
              <Activity className='h-6 w-6 text-white' />
              <span className='text-sm font-medium'>Real-time</span>
            </div>
            <div className='flex w-32 flex-col items-center gap-2 rounded-xl bg-white/10 p-4 backdrop-blur-sm'>
              <ShieldCheck className='h-6 w-6 text-white' />
              <span className='text-sm font-medium'>Safe Route</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Content */}
      <div className='flex flex-1 items-center justify-center p-6 lg:p-12'>
        <div className='animate-in fade-in slide-in-from-bottom-4 w-full max-w-md space-y-6 duration-500'>
          {children}
        </div>
      </div>
    </div>
  );
}
