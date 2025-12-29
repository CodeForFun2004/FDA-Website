"use client";

import React from 'react';
import { Activity, Droplets, ShieldCheck } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Side - Visual / Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-cyan-500 relative overflow-hidden items-center justify-center text-white p-12">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                <circle cx="90" cy="10" r="20" fill="white" />
            </svg>
        </div>
        
        <div className="relative z-10 max-w-lg space-y-6 text-center">
            <div className="flex flex-col items-center gap-4 mb-8">
                <div className="p-6 bg-white rounded-2xl shadow-xl">
                    <Droplets className="h-12 w-12 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">FDA System</h1>
            </div>
            
            <h2 className="text-4xl font-bold leading-tight">
                Hệ thống Giám sát Lũ lụt
            </h2>
            
            <p className="text-blue-100 text-lg">
                Cập nhật dữ liệu thời gian thực và gợi ý lộ trình an toàn cho cộng đồng.
            </p>

            <div className="flex justify-center gap-4 pt-8">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/10 backdrop-blur-sm w-32">
                    <Activity className="h-6 w-6 text-white" />
                    <span className="text-sm font-medium">Real-time</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/10 backdrop-blur-sm w-32">
                    <ShieldCheck className="h-6 w-6 text-white" />
                    <span className="text-sm font-medium">Safe Route</span>
                </div>
            </div>
        </div>
      </div>

      {/* Right Side - Form Content */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
        </div>
      </div>
    </div>
  );
}
