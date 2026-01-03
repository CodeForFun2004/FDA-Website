"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  X,
  Camera,
  User,
  Mail,
  Phone,
  ShieldCheck,
  ShieldX,
  Calendar,
  LogIn,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/common";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * ✅ Đồng bộ theo swagger:
 * GET /api/v1/user-profile -> { success, message, profile: {...} }
 * PUT /api/v1/user-profile (multipart/form-data): fullName + avatarFile/avatarUrl
 * POST /api/v1/auth/change-password: { currentPassword, newPassword, confirmPassword }
 */
export type UserProfile = {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;

  provider?: string | null;
  status?: string | null;
  lastLoginAt?: string | null;
  phoneVerifiedAt?: string | null;
  emailVerifiedAt?: string | null;
  roles: string[];

  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ProfileUpdatePayload = {
  fullName: string;
  avatarFile?: File | null;
  avatarUrl?: string | null;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ProfileModalProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  /** user là "profile" từ API GET /user-profile */
  user: UserProfile;

  /** nối vào PUT /user-profile (multipart/form-data) */
  onSaveProfile?: (payload: ProfileUpdatePayload) => Promise<void> | void;

  /** nối vào POST /auth/change-password */
  onChangePassword?: (payload: ChangePasswordPayload) => Promise<void> | void;
};

function pickPrimaryRole(roles: string[]) {
  const priority = ["SUPER_ADMIN", "ADMIN", "AUTHORITY", "USER"];
  for (const r of priority) if (roles?.includes(r)) return r;
  return roles?.[0] || "USER";
}

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function AvatarCircle({
  name,
  avatarUrl,
  onPickFile,
}: {
  name: string;
  avatarUrl?: string | null;
  onPickFile?: (file: File) => void;
}) {
  const initials =
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "U";

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <div className="relative">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name}
          className="h-20 w-20 rounded-2xl object-cover border border-input bg-background"
        />
      ) : (
        <div className="h-20 w-20 rounded-2xl border border-input bg-muted flex items-center justify-center text-xl font-semibold">
          {initials}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPickFile?.(f);
          e.currentTarget.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute -bottom-2 -right-2 h-9 w-9 rounded-xl border border-input bg-background shadow-sm flex items-center justify-center hover:bg-muted transition"
        title="Đổi ảnh đại diện"
      >
        <Camera className="h-4 w-4" />
      </button>
    </div>
  );
}

function SegmentTabs({
  value,
  onChange,
  tabs,
}: {
  value: string;
  onChange: (v: string) => void;
  tabs: { value: string; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-xl border border-input bg-muted p-1">
      {tabs.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              "px-3 py-2 text-sm rounded-lg transition",
              active
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function InfoBlock({
  icon: Icon,
  label,
  children,
  hint,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-input bg-background p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          {hint ? <div className="text-[11px] text-muted-foreground">{hint}</div> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

export function ProfileModal({
  open,
  onOpenChange,
  user,
  onSaveProfile,
  onChangePassword,
}: ProfileModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [tab, setTab] = React.useState<"profile" | "password">("profile");

  const [saving, setSaving] = React.useState(false);
  const [changingPw, setChangingPw] = React.useState(false);

  // editable (API cho phép)
  const [fullName, setFullName] = React.useState(user.fullName ?? "");
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(user.avatarUrl ?? null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);

  // password form
  const [pw, setPw] = React.useState<ChangePasswordPayload>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = React.useState({
    current: false,
    next: false,
    confirm: false,
  });

  const primaryRole = pickPrimaryRole(user.roles ?? []);
  const displayName = user.fullName?.trim() || user.email || "User";

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;

    setTab("profile");
    setSaving(false);
    setChangingPw(false);

    setFullName(user.fullName ?? "");
    setAvatarPreview(user.avatarUrl ?? null);
    setAvatarFile(null);

    setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowPw({ current: false, next: false, confirm: false });
  }, [open, user]);

  React.useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onOpenChange]);

  if (!mounted || !open) return null;

  const canSave = !!onSaveProfile && !saving;
  const canChangePw = !!onChangePassword && !changingPw;

  const body = (
    <div className="fixed inset-0 z-[60]">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />

      {/* modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl rounded-2xl border border-input bg-background shadow-xl overflow-hidden
                max-h-[calc(100vh-2rem)] flex flex-col">
          {/* header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-input">
            <div>
              <div className="text-base font-semibold">Hồ sơ cá nhân</div>
              <div className="text-sm text-muted-foreground">
                Xem & cập nhật thông tin tài khoản
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-10 w-10 rounded-xl hover:bg-muted flex items-center justify-center transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* content */}
          <div className="p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <SegmentTabs
                value={tab}
                onChange={(v) => setTab(v as any)}
                tabs={[
                  { value: "profile", label: "Thông tin" },
                  { value: "password", label: "Password" },
                ]}
              />
              <div className="text-xs text-muted-foreground">
                *API hiện tại chỉ update <b>Họ tên</b> & <b>Avatar</b>.
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* LEFT: chỉ avatar + name + role */}
              <div className="md:col-span-3 rounded-2xl border border-input bg-muted/30 p-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <AvatarCircle
                    name={displayName}
                    avatarUrl={avatarPreview}
                    onPickFile={(file) => {
                      setAvatarFile(file);
                      const url = URL.createObjectURL(file);
                      setAvatarPreview(url);
                    }}
                  />
                  <div className="min-w-0 w-full">
                    <div className="font-semibold truncate">{displayName}</div>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <span className="px-2 py-1 text-xs rounded-lg bg-background border border-input">
                        {primaryRole}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-muted-foreground space-y-1">
                  <div className="text-center truncate">{user.email}</div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="md:col-span-9">
                {tab === "profile" ? (
                  <div className="rounded-2xl border border-input bg-background p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="text-sm font-semibold">Thông tin tài khoản</div>
                      <div className="text-xs text-muted-foreground">
                        ID: <span className="font-mono">{user.id}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Editable: fullName */}
                      <InfoBlock icon={User} label="Họ tên" hint="Có thể cập nhật">
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Nhập họ tên"
                        />
                      </InfoBlock>

                      {/* Readonly: email */}
                      <InfoBlock icon={Mail} label="Email">
                        <Input value={user.email} disabled />
                      </InfoBlock>

                      {/* Readonly: phoneNumber */}
                      <InfoBlock icon={Phone} label="Số điện thoại" hint="Hiện API chưa hỗ trợ cập nhật">
                        <Input value={user.phoneNumber ?? ""} disabled placeholder="—" />
                      </InfoBlock>

                      {/* provider/status */}
                      <InfoBlock icon={ShieldCheck} label="Provider / Trạng thái">
                        <div className="grid grid-cols-2 gap-2">
                          <Input value={user.provider ?? ""} disabled placeholder="—" />
                          <Input value={user.status ?? ""} disabled placeholder="—" />
                        </div>
                      </InfoBlock>

                      {/* verification */}
                      <InfoBlock icon={ShieldCheck} label="Xác minh">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">Email</span>
                            {user.emailVerifiedAt ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600">
                                <ShieldCheck className="h-4 w-4" /> Đã xác minh
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <ShieldX className="h-4 w-4" /> Chưa xác minh
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">SĐT</span>
                            {user.phoneVerifiedAt ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600">
                                <ShieldCheck className="h-4 w-4" /> Đã xác minh
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <ShieldX className="h-4 w-4" /> Chưa xác minh
                              </span>
                            )}
                          </div>
                        </div>
                      </InfoBlock>

                      {/* roles */}
                      <InfoBlock icon={ShieldCheck} label="Roles">
                        <div className="flex flex-wrap gap-2">
                          {(user.roles ?? []).map((r) => (
                            <span
                              key={r}
                              className="px-2 py-1 text-xs rounded-lg bg-muted border border-input"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </InfoBlock>

                      {/* dates */}
                      {/* <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <InfoBlock icon={LogIn} label="Lần đăng nhập gần nhất">
                          <Input value={formatDateTime(user.lastLoginAt)} disabled />
                        </InfoBlock>
                        <InfoBlock icon={Calendar} label="Tạo lúc">
                          <Input value={formatDateTime(user.createdAt)} disabled />
                        </InfoBlock>
                        <InfoBlock icon={Calendar} label="Cập nhật lúc">
                          <Input value={formatDateTime(user.updatedAt)} disabled />
                        </InfoBlock>
                      </div> */}
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        className="h-11 rounded-xl"
                        disabled={saving}
                        onClick={() => {
                          setFullName(user.fullName ?? "");
                          setAvatarPreview(user.avatarUrl ?? null);
                          setAvatarFile(null);
                        }}
                      >
                        Hủy
                      </Button>

                      <Button
                        className="h-11 rounded-xl"
                        disabled={!canSave}
                        onClick={async () => {
                          if (!onSaveProfile) return;

                          try {
                            setSaving(true);
                            await onSaveProfile({
                              fullName: fullName.trim(),
                              avatarFile,
                              avatarUrl: null,
                            });
                          } finally {
                            setSaving(false);
                          }
                        }}
                      >
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // PASSWORD TAB
                  <div className="rounded-2xl border border-input bg-background p-4">
                    <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <KeyRound className="h-4 w-4" />
                      Đổi mật khẩu
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InfoBlock icon={KeyRound} label="Mật khẩu hiện tại">
                        <div className="relative">
                          <Input
                            type={showPw.current ? "text" : "password"}
                            value={pw.currentPassword}
                            onChange={(e) =>
                              setPw((p) => ({ ...p, currentPassword: e.target.value }))
                            }
                            placeholder="Nhập mật khẩu hiện tại"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw((s) => ({ ...s, current: !s.current }))}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label="Toggle password"
                          >
                            {showPw.current ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </InfoBlock>

                      <InfoBlock icon={KeyRound} label="Mật khẩu mới">
                        <div className="relative">
                          <Input
                            type={showPw.next ? "text" : "password"}
                            value={pw.newPassword}
                            onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
                            placeholder="Nhập mật khẩu mới"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw((s) => ({ ...s, next: !s.next }))}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label="Toggle password"
                          >
                            {showPw.next ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </InfoBlock>

                      <InfoBlock icon={KeyRound} label="Xác nhận mật khẩu mới">
                        <div className="relative">
                          <Input
                            type={showPw.confirm ? "text" : "password"}
                            value={pw.confirmPassword}
                            onChange={(e) =>
                              setPw((p) => ({ ...p, confirmPassword: e.target.value }))
                            }
                            placeholder="Nhập lại mật khẩu mới"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label="Toggle password"
                          >
                            {showPw.confirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </InfoBlock>

                      <div className="sm:col-span-2 rounded-2xl border border-input bg-muted/30 p-3 text-xs text-muted-foreground">
                        Tip: Mật khẩu mới phải trùng “Xác nhận”. Nếu backend có rule độ mạnh mật khẩu,
                        bạn có thể validate thêm tại đây.
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        className="h-11 rounded-xl"
                        disabled={changingPw}
                        onClick={() =>
                          setPw({ currentPassword: "", newPassword: "", confirmPassword: "" })
                        }
                      >
                        Reset
                      </Button>

                      <Button
                        className="h-11 rounded-xl"
                        disabled={!canChangePw}
                        onClick={async () => {
                          if (!onChangePassword) return;

                          // validate UI cơ bản
                          if (!pw.currentPassword || !pw.newPassword || !pw.confirmPassword) return;
                          if (pw.newPassword !== pw.confirmPassword) return;

                          try {
                            setChangingPw(true);
                            await onChangePassword(pw);
                            setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
                          } finally {
                            setChangingPw(false);
                          }
                        }}
                      >
                        {changingPw ? "Đang đổi..." : "Đổi mật khẩu"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="px-5 py-4 border-t border-input flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              *Avatar upload đang preview tại UI. Nối API multipart/form-data ở <code>onSaveProfile</code>.
            </div>
            <Button
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(body, document.body);
}
