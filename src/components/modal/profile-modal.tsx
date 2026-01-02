"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, User, Mail, Phone, MapPin, Building2, Camera } from "lucide-react";

import { Button } from "@/components/ui/common";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type UserProfile = {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  phone?: string;
  location?: string;
  organization?: string;
};

type ProfileModalProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: UserProfile;
  onSave?: (next: UserProfile) => Promise<void> | void;
};

function AvatarCircle({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const initials =
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "U";

  return (
    <div className="relative">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name}
          className="h-16 w-16 rounded-2xl object-cover border border-input bg-background"
        />
      ) : (
        <div className="h-16 w-16 rounded-2xl border border-input bg-muted flex items-center justify-center text-lg font-semibold">
          {initials}
        </div>
      )}
      <button
        type="button"
        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl border border-input bg-background shadow-sm flex items-center justify-center hover:bg-muted transition"
        title="Đổi ảnh (UI trước, logic upload làm sau)"
      >
        <Camera className="h-4 w-4" />
      </button>
    </div>
  );
}

function FieldRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-input bg-background p-3">
      <div className="mt-0.5 h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">{value || "—"}</div>
      </div>
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
              active ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function ProfileModal({ open, onOpenChange, user, onSave }: ProfileModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [tab, setTab] = React.useState<"overview" | "edit">("overview");
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState<UserProfile>(user);

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    // mỗi lần mở modal, sync lại dữ liệu
    if (open) {
      setTab("overview");
      setForm(user);
    }
  }, [open, user]);

  React.useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onOpenChange]);

  if (!mounted) return null;
  if (!open) return null;

  const body = (
    <div className="fixed inset-0 z-[60]">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      {/* modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl rounded-2xl border border-input bg-background shadow-xl overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-input">
            <div>
              <div className="text-base font-semibold">Hồ sơ cá nhân</div>
              <div className="text-sm text-muted-foreground">
                Xem và cập nhật thông tin tài khoản
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
                  { value: "overview", label: "Thông tin" },
                  { value: "edit", label: "Chỉnh sửa" },
                ]}
              />
              <div className="text-xs text-muted-foreground">
                *Phần đổi ảnh & API save có thể nối vào sau
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* left card */}
              <div className="md:col-span-4 rounded-2xl border border-input bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <AvatarCircle name={user.name} avatarUrl={user.avatarUrl} />
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{user.name}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {user.role || "Member"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <FieldRow icon={Mail} label="Email" value={user.email} />
                  <FieldRow icon={Phone} label="SĐT" value={user.phone} />
                  <FieldRow icon={MapPin} label="Địa chỉ" value={user.location} />
                  <FieldRow icon={Building2} label="Tổ chức" value={user.organization} />
                </div>
              </div>

              {/* right */}
              <div className="md:col-span-8">
                {tab === "overview" ? (
                  <div className="rounded-2xl border border-input bg-background p-4">
                    <div className="text-sm font-semibold mb-3">Chi tiết</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FieldRow icon={User} label="Họ tên" value={user.name} />
                      <FieldRow icon={Mail} label="Email" value={user.email} />
                      <FieldRow icon={Phone} label="Số điện thoại" value={user.phone} />
                      <FieldRow icon={Building2} label="Tổ chức" value={user.organization} />
                      <div className="sm:col-span-2">
                        <FieldRow icon={MapPin} label="Địa chỉ" value={user.location} />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button className="h-11 rounded-xl" onClick={() => setTab("edit")}>
                        Chỉnh sửa
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-input bg-background p-4">
                    <div className="text-sm font-semibold mb-3">Cập nhật thông tin</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Họ tên</label>
                        <Input
                          className="mt-1"
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Nhập họ tên"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground">Email</label>
                        <Input
                          className="mt-1"
                          value={form.email}
                          disabled
                          title="Email thường không cho sửa"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground">Số điện thoại</label>
                        <Input
                          className="mt-1"
                          value={form.phone || ""}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground">Tổ chức</label>
                        <Input
                          className="mt-1"
                          value={form.organization || ""}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, organization: e.target.value }))
                          }
                          placeholder="VD: FDA Team"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs text-muted-foreground">Địa chỉ</label>
                        <Input
                          className="mt-1"
                          value={form.location || ""}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, location: e.target.value }))
                          }
                          placeholder="Nhập địa chỉ"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        className="h-11 rounded-xl"
                        onClick={() => {
                          setForm(user);
                          setTab("overview");
                        }}
                        disabled={saving}
                      >
                        Hủy
                      </Button>
                      <Button
                        className="h-11 rounded-xl"
                        disabled={saving}
                        onClick={async () => {
                          try {
                            setSaving(true);
                            await onSave?.(form);
                            onOpenChange(false);
                          } finally {
                            setSaving(false);
                          }
                        }}
                      >
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
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
              Mẹo: Bạn có thể nối `onSave` vào API update profile sau.
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
