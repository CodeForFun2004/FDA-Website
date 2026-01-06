"use client";

import { useEffect } from "react";
import { useRouter } from "@/lib/router";
import { toast } from "sonner";
import { useAuthStore } from "@/features/authenticate/store/auth-store";
import { setSessionCookie } from "@/helpers/auth-session";

function parseHash() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  const sp = new URLSearchParams(hash);

  const accessToken = sp.get("accessToken");
  const refreshToken = sp.get("refreshToken");
  const expiresAt = sp.get("expiresAt");
  const userRaw = sp.get("user"); // base64/json tuỳ bạn encode

  return { accessToken, refreshToken, expiresAt, userRaw };
}

export default function GoogleFinishPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const { accessToken, refreshToken, expiresAt, userRaw } = parseHash();

      if (!accessToken || !refreshToken || !expiresAt || !userRaw) {
        toast.error("Missing session data from Google login.");
        router.push("/authenticate/login");
        return;
      }

      const user = JSON.parse(decodeURIComponent(userRaw));
      // normalize avatarUrl null -> undefined nếu bạn muốn
      if (user.avatarUrl === null) user.avatarUrl = undefined;

      // set thẳng vào store (bạn cần thêm action setSession, xem bên dưới)
      useAuthStore.getState().setSession({
        user,
        accessToken,
        refreshToken,
        expiresAt,
      });

      setSessionCookie();
      toast.success("Đăng nhập Google thành công!");

      // xoá hash khỏi url (đỡ lộ token)
      window.history.replaceState(null, "", "/authenticate/google/finish");

      // redirect theo role
      const roles = user?.roles ?? [];
      if (roles.includes("SUPER_ADMIN") || roles.includes("ADMIN")) router.push("/admin");
      else if (roles.includes("AUTHORITY")) router.push("/authority");
      else router.push("/");
    } catch (e: any) {
      toast.error(e?.message ?? "Google finish failed.");
      router.push("/authenticate/login");
    }
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="rounded-2xl border p-6">Finishing Google sign-in…</div>
    </div>
  );
}
