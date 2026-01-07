'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/common';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100'>
      <div className='w-full max-w-md space-y-8 p-8 text-center'>
        {/* Icon */}
        <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 shadow-lg'>
          <ShieldAlert className='h-10 w-10 text-red-600' />
        </div>

        {/* Content */}
        <div className='space-y-3'>
          <h1 className='text-4xl font-bold text-slate-900'>403</h1>
          <h2 className='text-2xl font-semibold text-slate-800'>
            Access Denied
          </h2>
          <p className='text-slate-600'>
            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị
            viên nếu bạn cho rằng đây là lỗi.
          </p>
        </div>

        {/* Actions */}
        <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
          <Button
            onClick={() => router.back()}
            variant='outline'
            className='gap-2'
          >
            <ArrowLeft className='h-4 w-4' />
            Quay lại
          </Button>
          <Button
            onClick={() => router.push('/admin/dashboard')}
            className='gap-2'
          >
            <Home className='h-4 w-4' />
            Về Dashboard
          </Button>
        </div>

        {/* Additional Info */}
        <div className='mt-8 rounded-lg border border-slate-200 bg-white p-4 text-left'>
          <h3 className='mb-2 text-sm font-semibold text-slate-700'>
            Cần trợ giúp?
          </h3>
          <p className='text-xs text-slate-600'>
            Nếu bạn tin rằng bạn nên có quyền truy cập, vui lòng liên hệ với
            quản trị viên hệ thống hoặc kiểm tra vai trò tài khoản của bạn.
          </p>
        </div>
      </div>
    </div>
  );
}
