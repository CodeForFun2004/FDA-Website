// src/features/authenticate/LoginFlow.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Input } from "../../components/ui/common";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { checkIdentifierApi, sendOtpApi } from "@/lib/api/auth";

type Step = "IDENTIFIER" | "OTP" | "PASSWORD";

function normalizeIdentifier(v: string) {
  return v.trim();
}

function isPasswordCase(res: any) {
  const required = String(res?.requiredMethod ?? "").toUpperCase();
  if (required === "PASSWORD") return true;
  if (required === "OTP") return false;
  return !!res?.hasPassword; // fallback
}

export default function LoginFlow(props: { onLoggedIn?: () => void }) {
  const loginWithPassword = useAuthStore((s) => s.loginWithPassword);
  const loginWithOtp = useAuthStore((s) => s.loginWithOtp);
  const authStatus = useAuthStore((s) => s.status);
  const clearError = useAuthStore((s) => s.clearError);

  const [step, setStep] = useState<Step>("IDENTIFIER");

  const [identifier, setIdentifier] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(Date.now());
  const [localLoading, setLocalLoading] = useState(false);

  const disabled = localLoading || authStatus === "loading";

  useEffect(() => {
    if (!expiresAt) return;
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const secondsLeft = useMemo(() => {
    if (!expiresAt) return null;
    const ms = new Date(expiresAt).getTime() - nowTick;
    return Math.max(0, Math.floor(ms / 1000));
  }, [expiresAt, nowTick]);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const id = normalizeIdentifier(identifier);
    if (!id) {
      toast.warning("Vui lòng nhập Email hoặc SĐT.");
      return;
    }

    setLocalLoading(true);
    try {
      const res = await checkIdentifierApi({ identifier: id });

      // nếu BE có accountExists
      if (res?.accountExists === false) {
        toast.error(res?.message || "Tài khoản không tồn tại.");
        return;
      }

      if (isPasswordCase(res)) {
        setStep("PASSWORD");
        return;
      }

      // OTP case
      setStep("OTP");
      const otpRes = await sendOtpApi({ identifier: id });

      setExpiresAt(otpRes?.expiresAt ?? null);
      setOtp("");
      toast.success(otpRes?.message || "Đã gửi OTP.");
    } catch (err: any) {
      toast.error(err?.message || "Không thể kiểm tra tài khoản.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResendOtp = async () => {
    clearError();
    const id = normalizeIdentifier(identifier);

    if (!id) return;

    setLocalLoading(true);
    try {
      const otpRes = await sendOtpApi({ identifier: id });
      setExpiresAt(otpRes?.expiresAt ?? null);
      setOtp("");
      toast.success(otpRes?.message || "Đã gửi lại OTP.");
    } catch (err: any) {
      toast.error(err?.message || "Gửi OTP thất bại.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const id = normalizeIdentifier(identifier);
    if (otp.length !== 6) {
      toast.warning("OTP phải đủ 6 số.");
      return;
    }

    try {
      await loginWithOtp(id, otp);
      toast.success("Đăng nhập thành công!");
      props.onLoggedIn?.();
    } catch (err: any) {
      toast.error(err?.message || "Đăng nhập thất bại.");
    }
  };

  const handleLoginPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const id = normalizeIdentifier(identifier);
    if (!password) {
      toast.warning("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      await loginWithPassword(id, password);
      toast.success("Đăng nhập thành công!");
      props.onLoggedIn?.();
    } catch (err: any) {
      toast.error(err?.message || "Đăng nhập thất bại.");
    }
  };

  if (step === "IDENTIFIER") {
    return (
      <form onSubmit={handleContinue} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="identifier">
            Email / Số điện thoại
          </label>
          <div className="relative">
            <Mail className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <Input
              id="identifier"
              placeholder="you@gmail.com hoặc +84..."
              className="pl-9"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
          </div>
        </div>

        <Button type="submit" className="h-11 w-full" disabled={disabled}>
          {disabled ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <span className="flex items-center">
              Tiếp tục <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
    );
  }

  if (step === "OTP") {
    return (
      <form onSubmit={handleLoginOtp} className="space-y-4">
        <div className="text-sm text-muted-foreground">
          OTP đã gửi tới: <span className="font-medium">{identifier}</span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="otp">
            Nhập OTP (6 số)
          </label>
          <Input
            id="otp"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••"
          />
          {secondsLeft !== null ? (
            <div className="text-xs text-muted-foreground">
              Hết hạn sau: {Math.floor(secondsLeft / 60)}:
              {String(secondsLeft % 60).padStart(2, "0")}
            </div>
          ) : null}
        </div>

        <Button type="submit" className="h-11 w-full" disabled={disabled}>
          {disabled ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1"
            onClick={() => {
              setOtp("");
              setExpiresAt(null);
              setStep("IDENTIFIER");
            }}
            disabled={disabled}
          >
            Đổi Email/SĐT
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1"
            onClick={handleResendOtp}
            disabled={disabled || (secondsLeft !== null && secondsLeft > 0)}
            title="Chỉ cho gửi lại khi OTP hết hạn (có thể đổi rule)"
          >
            Gửi lại OTP
          </Button>
        </div>
      </form>
    );
  }

  // PASSWORD
  return (
    <form onSubmit={handleLoginPassword} className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Tài khoản: <span className="font-medium">{identifier}</span>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <Lock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pr-12 pl-9"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <Button type="submit" className="h-11 w-full" disabled={disabled}>
        {disabled ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <span className="flex items-center">
            Sign In <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        )}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        onClick={() => {
          setPassword("");
          setStep("IDENTIFIER");
        }}
        disabled={disabled}
      >
        Quay lại
      </Button>
    </form>
  );
}
