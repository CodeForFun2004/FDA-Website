// src/app/auth/forbidden/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import { IconShieldLock, IconArrowLeft, IconLogout } from '@tabler/icons-react';

export default function ForbiddenPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className='bg-background flex min-h-screen items-center justify-center p-4'>
      <div className='w-full max-w-md text-center'>
        {/* Icon */}
        <div className='mb-6 flex justify-center'>
          <div className='bg-destructive/10 rounded-full p-6'>
            <IconShieldLock
              className='text-destructive h-16 w-16'
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Title */}
        <h1 className='mb-2 text-3xl font-bold tracking-tight'>
          Access Denied
        </h1>

        {/* Subtitle */}
        <p className='text-muted-foreground mb-6 text-lg'>
          Không có quyền truy cập
        </p>

        {/* Description */}
        <div className='bg-muted/50 mb-8 rounded-lg border p-4 text-left'>
          <p className='text-sm leading-relaxed'>
            Bạn không có quyền truy cập vào trang này. Hệ thống quản lý FDA chỉ
            dành cho:
          </p>
          <ul className='mt-3 space-y-1.5 text-sm'>
            <li className='flex items-center gap-2'>
              <span className='text-primary'>•</span>
              <span>
                <strong>Admin</strong> - Quản trị viên hệ thống
              </span>
            </li>
            <li className='flex items-center gap-2'>
              <span className='text-primary'>•</span>
              <span>
                <strong>Authority</strong> - Cán bộ chính quyền
              </span>
            </li>
            <li className='flex items-center gap-2'>
              <span className='text-primary'>•</span>
              <span>
                <strong>Super Admin</strong> - Quản trị cấp cao
              </span>
            </li>
          </ul>

          {user && (
            <div className='mt-4 border-t pt-3'>
              <p className='text-muted-foreground text-xs'>
                Đang đăng nhập với vai trò:{' '}
                <span className='font-semibold'>
                  {user.roles?.join(', ') || 'Unknown'}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className='flex flex-col gap-3'>
          <Button onClick={handleGoBack} variant='default' className='w-full'>
            <IconArrowLeft className='mr-2 h-4 w-4' />
            Quay lại trang trước
          </Button>

          <Button onClick={handleGoHome} variant='outline' className='w-full'>
            Về trang chủ
          </Button>

          <Button
            onClick={handleLogout}
            variant='ghost'
            className='text-muted-foreground w-full'
          >
            <IconLogout className='mr-2 h-4 w-4' />
            Đăng xuất
          </Button>
        </div>

        {/* Footer */}
        <div className='text-muted-foreground mt-8 text-xs'>
          <p>
            Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ quản trị viên hệ
            thống.
          </p>
        </div>
      </div>
    </div>
  );
}
