"use client";

import * as React from "react";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/common";
import { cn } from "@/lib/utils";

// ✅ ProfileModal mới (đã đồng bộ API) export: ProfileModal, UserProfile, ProfileUpdatePayload, ChangePasswordPayload
import {
  ProfileModal,
  type UserProfile,
  type ProfileUpdatePayload,
  type ChangePasswordPayload,
} from "@/components/modal/profile-modal";

import { getUserProfileApi } from "@/lib/api/user-profile";

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

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

function AvatarMini({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string | null;
}) {
  const initials =
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "U";

  return avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarUrl}
      alt={name}
      className="h-9 w-9 rounded-xl object-cover border border-input bg-background"
    />
  ) : (
    <div className="h-9 w-9 rounded-xl border border-input bg-muted flex items-center justify-center text-xs font-semibold">
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
    role?: string;
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
  onChangePassword,
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
      toast.error(e?.message ?? "Không lấy được hồ sơ.");
      // giữ fallback tối thiểu để modal vẫn mở được
      setProfile((prev) =>
        prev ??
        ({
          id: "—",
          email: user.email,
          fullName: user.name,
          phoneNumber: null,
          avatarUrl: user.avatarUrl ?? null,
          roles: user.role ? [user.role] : ["USER"],
        } as UserProfile)
      );
    } finally {
      setLoadingProfile(false);
    }
  }, [user.email, user.name, user.avatarUrl, user.role]);

  const openProfileModal = async () => {
    setOpen(false);
    setProfileOpen(true);
    await loadProfile();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-input bg-background px-2 py-2 hover:bg-muted transition",
          open && "bg-muted"
        )}
      >
        <AvatarMini name={user.name} avatarUrl={user.avatarUrl} />
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium leading-4">{user.name}</div>
          <div className="text-xs text-muted-foreground leading-4">
            {user.role || "Member"}
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-input bg-background shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-input bg-muted/30">
            <div className="flex items-center gap-3">
              <AvatarMini name={user.name} avatarUrl={user.avatarUrl} />
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              type="button"
              className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted transition"
              onClick={openProfileModal}
            >
              <User className="h-4 w-4" />
              Profile
              {loadingProfile ? (
                <span className="ml-auto text-xs text-muted-foreground">...</span>
              ) : null}
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted transition"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>

            <div className="my-2 h-px bg-border" />

            <Button
              variant="outline"
              className="w-full h-11 rounded-xl justify-start gap-2"
              onClick={() => {
                setOpen(false);
                onLogout?.();
              }}
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
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
