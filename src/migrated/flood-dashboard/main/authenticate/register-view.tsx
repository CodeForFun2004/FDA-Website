"use client";

import React, { useState } from "react";
import { useRouter } from "@/migrated/flood-dashboard/lib/router";
import Link from "next/link";
import { useAppStore } from "@/migrated/flood-dashboard/lib/store";
import { Button, Input } from "@/migrated/flood-dashboard/components/ui/common";
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from "lucide-react";
import type { User } from "@/migrated/flood-dashboard/lib/types";
import { setSessionCookie } from "@/helpers/auth-session";

export default function RegisterViewPage() {
  const router = useRouter();
  const { login } = useAppStore(); // dùng login để set user sau khi register (giống flow demo)
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API Call
    setTimeout(() => {
      const mockUser: User = {
        id: "r-001",
        name: "New User",
        email: "newuser@fda.gov",
        role: "Viewer",
        status: "Active",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      login(mockUser);
      setIsLoading(false);

      // Sau khi đăng ký xong, chuyển hướng (bạn có thể đổi theo flow thật)
      router.push("/admin");
    }, 1500);
  };

  const handleGoogleRegister = () => {
    setIsLoading(true);

    setTimeout(() => {
      const mockUser: User = {
        id: "g-r-001",
        name: "Google New User",
        email: "newuser@gmail.com",
        role: "Viewer",
        status: "Active",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      login(mockUser);
      setSessionCookie(); // mặc định 7 ngày
      router.push("/admin");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="text-muted-foreground">
          Enter your information to get started.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">
            Full name
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirmPassword">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="pl-9"
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <span className="flex items-center">
              Sign Up <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        className="w-full h-11"
        onClick={handleGoogleRegister}
        disabled={isLoading}
      >
        <svg
          className="mr-2 h-4 w-4"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="google"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 488 512"
        >
          <path
            fill="currentColor"
            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
          />
        </svg>
        Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/authenticate/login"
          className="font-semibold text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
