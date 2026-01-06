"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@/lib/router";
import { useAuthStore } from "@/features/authenticate/store/auth-store";

function safeDecode(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

// Chặn open-redirect: chỉ cho phép path nội bộ dạng "/..."
function getSafeReturnUrl(raw: string | null) {
  const fallback = "/admin";
  if (!raw) return fallback;

  const decoded = safeDecode(raw).trim();
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return fallback;

  return decoded;
}

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // ✅ chặn chạy nhiều lần (dev/preload)
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    // Parse URL fragment: #access_token=xxx&refresh_token=yyy&return_url=/admin
    const hash = window.location.hash?.startsWith("#")
      ? window.location.hash.slice(1)
      : "";

    const params = new URLSearchParams(hash);

    let user: any = null;
const userRaw = params.get("user");
if (userRaw) {
  try {
    user = JSON.parse(safeDecode(userRaw));
  } catch {
    user = null;
  }
}


    // Ưu tiên lấy từ hash; nếu hash rỗng thì fallback từ localStorage
    const accessToken =
      params.get("access_token") ??
      params.get("accessToken") ??
      localStorage.getItem("accessToken") ??
      localStorage.getItem("access_token") ??
      "";

    const refreshToken =
      params.get("refresh_token") ??
      params.get("refreshToken") ??
      localStorage.getItem("refreshToken") ??
      localStorage.getItem("refresh_token") ??
      "";

    const returnUrl = getSafeReturnUrl(
      params.get("return_url") ?? params.get("returnUrl")
    );

    if (!accessToken || !refreshToken) {
      const msg = "Missing access_token/refresh_token from callback.";
      setError(msg);
      toast.error("Google login failed.");
      router.replace("/authenticate/login?error=oauth_failed");
      return;
    }

    try {
      // Lưu tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      // ✅ HYDRATE zustand store để fda_auth không còn null
      // (đúng theo shape bạn đang thấy trong localStorage)
      useAuthStore.setState(
        (prev: any) => ({
          ...prev,
          status: "authenticated",
          accessToken,
          refreshToken,
          // nếu bạn có expiresAt thì set luôn ở đây (nếu không thì cứ null)
          // expiresAt: prev.expiresAt ?? null,
          user, // ✅ set user từ BE
        }),
        false
      );

      // Xoá hash khỏi URL để sạch (tránh lưu token trong history)
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
      router.replace("/authenticate/login?error=oauth_failed");
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
