'use client';

import * as React from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/common';
import { cn } from '@/lib/utils';

// ✅ ProfileModal mới (đã đồng bộ API) export: ProfileModal, UserProfile, ProfileUpdatePayload, ChangePasswordPayload
import {
  ProfileModal,
  type UserProfile,
  type ProfileUpdatePayload,
  type ChangePasswordPayload
} from '@/features/profile/components/profile-modal';

import { getUserProfileApi } from '@/features/profile/api/user-profile.api';

function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void
) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el) return;
      if (el.contains(event.target as Node)) return;
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

function AvatarMini({
  name,
  avatarUrl
}: {
  name: string;
  avatarUrl?: string | null;
}) {
  const initials =
    name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('') || 'U';

  return avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarUrl}
      alt={name}
      className='border-input bg-background h-9 w-9 rounded-xl border object-cover'
    />
  ) : (
    <div className='border-input bg-muted flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-semibold'>
      {initials}
    </div>
  );
}

type ProfileMenuProps = {
  /**
   * user nhẹ để hiển thị menu (từ auth-store / header)
   * ProfileModal sẽ fetch profile đầy đủ qua GET /user-profile
   */
  user: {
    name: string;
    email: string;
    avatarUrl?: string | null;
    roles?: string[];
  };

  onLogout?: () => void;

  /**
   * Nối API PUT /user-profile (multipart) ở parent (Header)
   * payload mới: { fullName, avatarFile?, avatarUrl? }
   */
  onSaveProfile?: (payload: ProfileUpdatePayload) => Promise<void> | void;

  /**
   * Nối API POST /auth/change-password ở parent (Header)
   */
  onChangePassword?: (payload: ChangePasswordPayload) => Promise<void> | void;
};

export function ProfileMenu({
  user,
  onLogout,
  onSaveProfile,
  onChangePassword
}: ProfileMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const [loadingProfile, setLoadingProfile] = React.useState(false);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  const ref = React.useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));

  const loadProfile = React.useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await getUserProfileApi();
      setProfile(res.profile);
    } catch (e: any) {
      toast.error(e?.message ?? 'Unable to load profile.');
      // giữ fallback tối thiểu để modal vẫn mở được
      setProfile(
        (prev) =>
          prev ??
          ({
            id: '—',
            email: user.email,
            fullName: user.name,
            phoneNumber: null,
            avatarUrl: user.avatarUrl ?? null,
            roles: user.roles && user.roles.length > 0 ? user.roles : ['USER']
          } as UserProfile)
      );
    } finally {
      setLoadingProfile(false);
    }
  }, [user.email, user.name, user.avatarUrl, user.roles]);

  const openProfileModal = async () => {
    setOpen(false);
    setProfileOpen(true);
    await loadProfile();
  };

  return (
    <div className='relative' ref={ref}>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'border-input bg-background hover:bg-muted flex items-center gap-2 rounded-xl border px-2 py-2 transition',
          open && 'bg-muted'
        )}
      >
        <AvatarMini name={user.name} avatarUrl={user.avatarUrl} />
        <div className='hidden text-left sm:block'>
          <div className='text-sm leading-4 font-medium'>{user.name}</div>
          <div className='text-muted-foreground text-xs leading-4'>
            {user.roles && user.roles.length > 0
              ? user.roles.join(', ')
              : 'Member'}
          </div>
        </div>
        <ChevronDown
          className={cn('h-4 w-4 transition', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className='border-input bg-background absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border shadow-lg'>
          <div className='border-input bg-muted/30 border-b p-3'>
            <div className='flex items-center gap-3'>
              <AvatarMini name={user.name} avatarUrl={user.avatarUrl} />
              <div className='min-w-0'>
                <div className='truncate text-sm font-semibold'>
                  {user.name}
                </div>
                <div className='text-muted-foreground truncate text-xs'>
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          <div className='p-2'>
            <button
              type='button'
              className='hover:bg-muted flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition'
              onClick={openProfileModal}
            >
              <User className='h-4 w-4' />
              Profile
              {loadingProfile ? (
                <span className='text-muted-foreground ml-auto text-xs'>
                  ...
                </span>
              ) : null}
            </button>

            <button
              type='button'
              className='hover:bg-muted flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition'
              onClick={() => setOpen(false)}
            >
              <Settings className='h-4 w-4' />
              Settings
            </button>

            <div className='bg-border my-2 h-px' />

            <Button
              variant='outline'
              className='h-11 w-full justify-start gap-2 rounded-xl'
              onClick={() => {
                setOpen(false);
                onLogout?.();
              }}
            >
              <LogOut className='h-4 w-4' />
              Sign out
            </Button>
          </div>
        </div>
      )}

      {/* Modal: chỉ render khi mở */}
      {profileOpen && profile && (
        <ProfileModal
          open={profileOpen}
          onOpenChange={(v) => {
            setProfileOpen(v);
            if (!v) {
              // optional: clear profile state nếu muốn
              // setProfile(null);
            }
          }}
          user={profile}
          onSaveProfile={async (payload) => {
            if (!onSaveProfile) return;

            await onSaveProfile(payload);
            // reload lại để reflect UI từ backend
            await loadProfile();
          }}
          onChangePassword={onChangePassword}
        />
      )}
    </div>
  );
}
