"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useRouter } from "@/lib/router";
import { useAuthStore } from "@/stores/auth-store";
import { setSessionCookie } from "@/helpers/auth-session";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const loginWithGoogleCallback = useAuthStore((s) => s.loginWithGoogleCallback);

  const [error, setError] = useState<string | null>(null);

  const code = useMemo(() => searchParams.get("code"), [searchParams]);
  const state = useMemo(() => searchParams.get("state"), [searchParams]);

  const getRedirectPath = () => {
    const user = useAuthStore.getState().user;
    const roles = user?.roles ?? [];

    if (roles.includes("SUPER_ADMIN")) return "/admin";
    if (roles.includes("ADMIN")) return "/admin";
    if (roles.includes("AUTHORITY")) return "/authority";

    // ưu tiên next nếu có
    const next = sessionStorage.getItem("post_login_redirect");
    if (next) return next;

    return "/";
  };

  useEffect(() => {
    const run = async () => {
      if (!code || !state) {
        setError("Missing code/state from Google.");
        return;
      }

      // check state (khuyến nghị)
      const expectedState = sessionStorage.getItem("google_oauth_state");
      if (expectedState && expectedState !== state) {
        setError("Invalid OAuth state.");
        return;
      }

      try {
        await loginWithGoogleCallback(code, state);

        setSessionCookie();
        toast.success("Đăng nhập Google thành công!");

        sessionStorage.removeItem("google_oauth_state");
        sessionStorage.removeItem("post_login_redirect");

        router.push(getRedirectPath());
      } catch (e: any) {
        setError(e?.message ?? "Google login failed.");
        toast.error(e?.message ?? "Google login failed.");
      }
    };

    run();
  }, [code, state, loginWithGoogleCallback, router]);

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
