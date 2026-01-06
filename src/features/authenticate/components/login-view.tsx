// src/features/authenticate/login-view.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/router";
import Link from "next/link";
import { Button } from "../../../components/ui/common";
import { useAuthStore } from "@/features/authenticate/store/auth-store";
import { setSessionCookie } from "@/helpers/auth-session";
import { toast } from "sonner";
import { initGoogleOAuthApi } from "@/features/authenticate/api/auth";
import LoginFlow from "./LoginFlow";

export default function LoginViewPage() {
  const router = useRouter();

  const status = useAuthStore((s) => s.status);
  const clearError = useAuthStore((s) => s.clearError);

  const [googleLoading, setGoogleLoading] = useState(false);
  const disabled = status === "loading" || googleLoading;

  const getRedirectPath = () => {
    const user = useAuthStore.getState().user;
    const roles = user?.roles ?? [];

    if (roles.includes("SUPER_ADMIN")) return "/admin";
    if (roles.includes("ADMIN")) return "/admin";
    if (roles.includes("AUTHORITY")) return "/authority";
    return "/";
  };

  const onLoggedIn = () => {
    setSessionCookie(); // giữ nếu bạn đang dùng cookie marker
    router.push(getRedirectPath());
  };

  // const handleGoogleLogin = async () => {
  //   clearError();
  //   setGoogleLoading(true);

  //   try {
  //     const returnUrl = `${window.location.origin}/authenticate/google/callback`;
  //     console.log("Check Return URL:", returnUrl);

  //     const next = new URLSearchParams(window.location.search).get("next") ?? "";
  //     if (next) sessionStorage.setItem("post_login_redirect", next);

  //     const { authorizationUrl, state } = await initGoogleOAuthApi({ returnUrl });

  //     sessionStorage.setItem("google_oauth_state", state);
  //     window.location.href = authorizationUrl;
  //   } catch (e: any) {
  //     toast.error(e?.message ?? "Không thể bắt đầu Google Sign-In.");
  //   } finally {
  //     setGoogleLoading(false);
  //   }
  // };


  const handleGoogleLogin = async () => {
  clearError();
  setGoogleLoading(true);

  try {
    const next =
      new URLSearchParams(window.location.search).get("next") || "/";

    // returnUrl phải là trang sau login (path nội bộ)
    const returnUrl = next.startsWith("/") ? next : "/dashboard";

    // callback FE theo flow mới
    const callbackUrl = `${window.location.origin}/auth/callback`;

    console.log("callbackUrl:", callbackUrl);
    console.log("returnUrl:", returnUrl);

    // nếu bạn còn dùng post_login_redirect thì ok, nhưng flow mới đã có return_url
    // sessionStorage.setItem("post_login_redirect", returnUrl);

    const { authorizationUrl } = await initGoogleOAuthApi({
      returnUrl,
      callbackUrl, // có thể BE không cần, nhưng gửi cũng không hại nếu BE ignore
    });

    window.location.assign(authorizationUrl);
  } catch (e: any) {
    toast.error(e?.message ?? "Không thể bắt đầu Google Sign-In.");
  } finally {
    setGoogleLoading(false);
  }
};


  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground">
          Nhập Email/SĐT để đăng nhập bằng OTP hoặc Password.
        </p>
      </div>

      <LoginFlow onLoggedIn={onLoggedIn} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        className="h-11 w-full"
        onClick={handleGoogleLogin}
        disabled={disabled}
      >
        <img
          src="https://www.gstatic.com/devrel-devsite/prod/ve08add287a6b4bdf8961ab8a1be50bf551be3816cdd70b7cc934114ff3ad5f10/developers/images/touchicon-180-new.png"
          alt="Google"
          className="mr-2 h-6 w-6"
        />
        Google
      </Button>

      {/* <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/authenticate/register"
          className="text-primary font-semibold hover:underline"
        >
          Sign up
        </Link>
      </p> */}
    </div>
  );
}
