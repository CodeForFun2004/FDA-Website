"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@/lib/router";

function safeDecode(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

// Chặn open-redirect: chỉ cho phép path nội bộ dạng "/..."
function getSafeReturnUrl(raw: string | null) {
  const fallback = "/dashboard";
  if (!raw) return fallback;

  const decoded = safeDecode(raw).trim();

  // chỉ cho phép relative path bắt đầu bằng "/" và không phải "//"
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return fallback;

  return decoded;
}

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse URL fragment: #access_token=xxx&refresh_token=yyy&return_url=/dashboard
    const hash = window.location.hash?.startsWith("#")
      ? window.location.hash.slice(1)
      : "";

    const params = new URLSearchParams(hash);

    const accessToken =
      params.get("access_token") ?? params.get("accessToken") ?? "";
    const refreshToken =
      params.get("refresh_token") ?? params.get("refreshToken") ?? "";

    const returnUrl = getSafeReturnUrl(
      params.get("return_url") ?? params.get("returnUrl")
    );

    if (!accessToken || !refreshToken) {
      const msg = "Missing access_token/refresh_token from callback.";
      setError(msg);
      toast.error("Google login failed.");
      router.replace("/login?error=oauth_failed");
      return;
    }

    try {
      // Lưu tokens (theo đề xuất)
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // (Tuỳ chọn) nếu code cũ của bạn còn chỗ nào đọc theo snake_case
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      // Xoá hash khỏi URL để sạch sẽ (tránh lưu token trong history)
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );

      toast.success("Đăng nhập Google thành công!");
      window.location.replace(returnUrl);
    } catch (e: any) {
      const msg = e?.message ?? "Failed to persist tokens.";
      setError(msg);
      toast.error("Google login failed.");
      router.replace("/login?error=oauth_failed");
    }
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-background p-6">
        <h1 className="text-lg font-semibold">Signing you in…</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we complete Google authentication.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
