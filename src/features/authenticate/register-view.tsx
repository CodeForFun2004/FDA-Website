"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/router";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Button, Input } from '../../components/ui/common';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from "lucide-react";
import type { User } from "@/lib/types";
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
              placeholder="nguyenvana@gmail.com"
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
       <img
          src='https://www.gstatic.com/devrel-devsite/prod/ve08add287a6b4bdf8961ab8a1be50bf551be3816cdd70b7cc934114ff3ad5f10/developers/images/touchicon-180-new.png'
          alt='Google'
          className='mr-2 h-6 w-6'
        />
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
