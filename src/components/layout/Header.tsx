'use client';

import { useRouter } from 'next/navigation';
import { PanelLeft, Sun, Moon, Bell, Search } from 'lucide-react';
import { useAppStore } from '../../libs/store';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import { cn } from '@/libs/utils';

import { Button, Input } from '../../components/ui/common';
import { clearSessionCookie } from '@/helpers/auth-session';
import { toast } from 'sonner';
import {
  updateUserProfileApi,
  changePasswordApi
} from '@/features/profile/api/user-profile.api';
import { ProfileMenu } from './ProfileMenu';

export const Header = () => {
  const { theme, setTheme, isSidebarOpen, toggleSidebar } = useAppStore();
  const router = useRouter();

  const authUser = useAuthStore((s) => s.user);
  const authStatus = useAuthStore((s) => s.status);
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
    clearSessionCookie(); // clear cookie fda_session (nếu bạn vẫn dùng)
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
        aria-label='Toggle sidebar'
      >
        <PanelLeft className='h-5 w-5' />
      </Button>

      <div className='flex flex-1 items-center gap-4 md:gap-6'>
        <form className='hidden flex-1 md:block'>
          <div className='relative flex transition-all duration-300'>
            <Search className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
            <Input
              type='search'
              placeholder='Search...'
              className={cn(
                'bg-muted/20 hover:bg-muted/50 focus:bg-background w-full pl-9 transition-all duration-500 ease-in-out',
                isSidebarOpen
                  ? 'md:w-[240px] lg:w-[300px]'
                  : 'md:w-[300px] lg:w-[400px]'
              )}
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

              toast.success(res.message || 'Profile updated successfully');
            }}
            onChangePassword={async (payload) => {
              if (payload.newPassword !== payload.confirmPassword) {
                toast.error('New password and confirmation do not match');
                return;
              }
              const res = await changePasswordApi(payload);
              toast.success(res.message || 'Password changed successfully');
            }}
          />
        </div>
      </div>
    </header>
  );
};
