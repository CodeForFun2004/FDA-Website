'use client';

import { useRouter } from 'next/navigation';
import { PanelLeft, Sun, Moon, Bell } from 'lucide-react';
import { useAppStore } from '../../libs/store';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import { Button } from '../../components/ui/common';
import { clearAuthSessionCookies } from '@/helpers/auth-session';
import { toast } from 'sonner';
import {
  updateUserProfileApi,
  changePasswordApi
} from '@/features/profile/api/user-profile.api';
import { ProfileMenu } from './ProfileMenu';

export const Header = () => {
  const { theme, setTheme, toggleSidebar } = useAppStore();
  const router = useRouter();

  const authUser = useAuthStore((s) => s.user);
  const authLogout = useAuthStore((s) => s.logout);

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // src/components/layout/Header.tsx
  const displayName = authUser?.fullName?.trim() || authUser?.email || null;
  const displayRoles = authUser?.roles ?? [];
  // Nếu không có user → không render ProfileMenu
  if (!displayName) {
    return null; // hoặc redirect
  }

  const handleLogout = () => {
    authLogout(); // clear auth zustand (token/user)
    clearAuthSessionCookies();
    router.replace('/auth/login');
  };

  // Map user sang shape của ProfileMenu/ProfileModal
  const userForMenu = {
    name: displayName,
    email: authUser?.email || 'unknown@local',
    roles: displayRoles,
    avatarUrl: authUser?.avatarUrl ?? undefined // ✅ null -> undefined
    // phone: authUser?.phone,
    // location: authUser?.location,
    // organization: authUser?.organization
  };

  return (
    <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex h-16 w-full items-center gap-2 border-b px-4 backdrop-blur'>
      {/* Sidebar Trigger - always visible */}
      <Button
        variant='ghost'
        size='icon'
        className='h-8 w-8 shrink-0'
        onClick={toggleSidebar}
        aria-label='Mở hoặc đóng menu'
      >
        <PanelLeft className='h-5 w-5' />
      </Button>

      <div className='flex flex-1' />

      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={handleThemeToggle}>
          {theme === 'light' ? (
            <Sun className='h-5 w-5' />
          ) : (
            <Moon className='h-5 w-5' />
          )}
        </Button>

        <Button variant='ghost' size='icon'>
          <Bell className='h-5 w-5' />
          <span className='sr-only'>Thông báo</span>
        </Button>

        {/* Giữ đúng layout "pl-4 border-l" như code gốc */}
        <div className='relative border-l pl-4'>
          <ProfileMenu
            user={userForMenu}
            onLogout={handleLogout}
            onSaveProfile={async (payload) => {
              // payload: { fullName, avatarFile?, avatarUrl? }
              const fd = new FormData();
              if (payload.fullName) fd.append('fullName', payload.fullName);
              if (payload.avatarFile)
                fd.append('avatarFile', payload.avatarFile);
              if (payload.avatarUrl) fd.append('avatarUrl', payload.avatarUrl);

              console.log(
                'Updating profile with:',
                payload.avatarFile,
                payload.avatarUrl
              );

              const res = await updateUserProfileApi(fd);

              // ✅ update auth-store để Header/Avatar đổi ngay
              useAuthStore.setState((s) => ({
                user: s.user
                  ? {
                      ...s.user,
                      fullName: res.profile.fullName,
                      avatarUrl: res.profile.avatarUrl,
                      phoneNumber: res.profile.phoneNumber
                    }
                  : s.user
              }));

              toast.success(res.message || 'Đã cập nhật hồ sơ');
            }}
            onChangePassword={async (payload) => {
              if (payload.newPassword !== payload.confirmPassword) {
                toast.error('Mật khẩu mới và xác nhận không khớp');
                return;
              }
              const res = await changePasswordApi(payload);
              toast.success(res.message || 'Đã đổi mật khẩu');
            }}
          />
        </div>
      </div>
    </header>
  );
};
