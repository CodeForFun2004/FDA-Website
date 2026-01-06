'use client';

import { useRouter } from 'next/navigation';
import { Menu, Sun, Moon, Bell, Search } from 'lucide-react';

import { useAppStore } from '../../lib/store';
import { useAuthStore } from '@/features/authenticate/store/auth-store';

import { Button, Input } from '../../components/ui/common';
import { clearSessionCookie } from '@/helpers/auth-session';
import { toast } from "sonner";
import { updateUserProfileApi, changePasswordApi } from "@/features/profile/api/user-profile";
import { ProfileMenu } from './ProfileMenu';

export const Header = () => {
  const { toggleSidebar, theme, setTheme } = useAppStore();
  const router = useRouter();

  const authUser = useAuthStore((s) => s.user);
  const authStatus = useAuthStore((s) => s.status);
  const authLogout = useAuthStore((s) => s.logout);

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const displayName =
    authUser?.fullName?.trim() ||
    authUser?.email ||
    (authStatus === 'authenticated' ? 'User' : 'Guest');

  const displayRole = authUser?.roles?.[0] || 'Viewer';

  const handleLogout = () => {
    authLogout(); // clear auth zustand (token/user)
    clearSessionCookie(); // clear cookie fda_session (nếu bạn vẫn dùng)
    router.replace('/authenticate/login');
  };

  // Map user sang shape của ProfileMenu/ProfileModal
  const userForMenu = {
    name: displayName,
    email: authUser?.email || 'unknown@local',
    role: displayRole,
    avatarUrl: authUser?.avatarUrl ?? undefined // ✅ null -> undefined
    // phone: authUser?.phone,
    // location: authUser?.location,
    // organization: authUser?.organization
  };

  return (
    <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b px-6 backdrop-blur'>
      <Button
        variant='ghost'
        size='icon'
        className='lg:hidden'
        onClick={toggleSidebar}
      >
        <Menu className='h-5 w-5' />
      </Button>

      <div className='flex flex-1 items-center gap-4 md:gap-8'>
        <form className='hidden max-w-sm flex-1 md:block'>
          <div className='relative'>
            <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
            <Input
              type='search'
              placeholder='Search...'
              className='bg-background w-full pl-8 md:w-[300px] lg:w-[300px]'
            />
          </div>
        </form>
      </div>

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
          <span className='sr-only'>Notifications</span>
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

              console.log('Updating profile with:', payload.avatarFile, payload.avatarUrl);

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

              toast.success(res.message || 'Cập nhật hồ sơ thành công');
            }}
            onChangePassword={async (payload) => {
              if (payload.newPassword !== payload.confirmPassword) {
                toast.error('Mật khẩu mới và xác nhận không khớp');
                return;
              }
              const res = await changePasswordApi(payload);
              toast.success(res.message || 'Đổi mật khẩu thành công');
            }}
          />
        </div>
      </div>
    </header>
  );
};
