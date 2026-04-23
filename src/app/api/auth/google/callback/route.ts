// import { NextRequest, NextResponse } from 'next/server';

// export async function GET(request: NextRequest) {
//   const searchParams = request.nextUrl.searchParams;
//   const code = searchParams.get('code');
//   const state = searchParams.get('state');

//   if (!code || !state) {
//     return NextResponse.redirect(new URL('/login?error=missing_params', request.url));
//   }

//   try {
//     // Gọi backend API để đổi code lấy tokens
//     const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7097';
//     const response = await fetch(
//       `${backendUrl}/auth/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
//       {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     const data = await response.json();
//     // debug logs removed

//     if (!response.ok || !data.success) {
//       return NextResponse.redirect(
//         new URL(`/authenticate/login?error=${encodeURIComponent(data.message || 'oauth_failed')}`, request.url)
//       );
//     }

//     // Lấy returnUrl từ state hoặc mặc định
//     const returnUrl = data.returnUrl || '/dashboard';
//     // debug logs removed

//     // Redirect về trang callback với tokens trong fragment
//     const callbackUrl = new URL('/auth/callback', request.url);
//     // debug logs removed
//     callbackUrl.hash = `access_token=${encodeURIComponent(data.accessToken)}&refresh_token=${encodeURIComponent(data.refreshToken)}&return_url=${encodeURIComponent(returnUrl)}`;

//     return NextResponse.redirect(callbackUrl.toString());
//   } catch (error: any) {
//     console.error('OAuth callback error:', error);
//     return NextResponse.redirect(
//       new URL(`/authenticate/login?error=${encodeURIComponent(error.message || 'system_error')}`, request.url)
//     );
//   }
// }

// import { NextRequest, NextResponse } from "next/server";

// const LOGIN_PATH = "/authenticate/login";

// function safeReturnUrl(raw?: string) {
//   const fallback = "/dashboard";
//   const v = (raw || fallback).trim();
//   if (!v.startsWith("/") || v.startsWith("//")) return fallback;
//   return v;
// }

// export async function GET(request: NextRequest) {
//   const sp = request.nextUrl.searchParams;
//   const code = sp.get("code");
//   const state = sp.get("state");

//   if (!code || !state) {
//     return NextResponse.redirect(
//       new URL(`${LOGIN_PATH}?error=missing_params`, request.url)
//     );
//   }

//   try {
//     const backendBase =
//       process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7097";
//     // debug logs removed

//     const url = new URL(`${backendBase.replace(/\/$/, "")}/auth/google/callback`);
//     url.searchParams.set("code", code);
//     url.searchParams.set("state", state);

//     const response = await fetch(url.toString(), {
//       method: "GET",
//       cache: "no-store",
//       headers: {
//         Accept: "application/json",
//         // ✅ KHÔNG set Content-Type cho GET không body
//       },
//     });

//     const text = await response.text();
//     let data: any = null;
//     try {
//       data = text ? JSON.parse(text) : null;
//     } catch {
//       data = null;
//     }

//     // debug logs removed

//     if (!response.ok || !data?.success) {
//       const msg = data?.message || `oauth_failed_${response.status}`;
//       return NextResponse.redirect(
//         new URL(`${LOGIN_PATH}?error=${encodeURIComponent(msg)}`, request.url)
//       );
//     }

//     const returnUrl = safeReturnUrl(data.returnUrl);
//     // debug logs removed

//     const callbackUrl = new URL("/auth/callback", request.url);
//     callbackUrl.hash =
//       `access_token=${encodeURIComponent(data.accessToken)}` +
//       `&refresh_token=${encodeURIComponent(data.refreshToken)}` +
//       `&return_url=${encodeURIComponent(returnUrl)}`;

//     return NextResponse.redirect(callbackUrl.toString());
//   } catch (error: any) {
//     console.error("OAuth callback error:", error);
//     return NextResponse.redirect(
//       new URL(
//         `${LOGIN_PATH}?error=${encodeURIComponent(error?.message || "system_error")}`,
//         request.url
//       )
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { getPublicApiBaseUrl } from '@/libs/env';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    // ✅ /login -> /authenticate/login
    return NextResponse.redirect(
      new URL('/auth/login?error=missing_params', request.url)
    );
  }

  try {
    // Gọi backend API để đổi code lấy tokens
    const backendUrl = getPublicApiBaseUrl();

    const response = await fetch(
      `${backendUrl}/auth/google/callback?code=${encodeURIComponent(
        code
      )}&state=${encodeURIComponent(state)}`,
      {
        method: 'GET',
        headers: {
          // ✅ Bỏ Content-Type cho GET, thay bằng Accept
          Accept: 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(data.message || 'oauth_failed')}`,
          request.url
        )
      );
    }

    // Lấy returnUrl từ BE; nếu không có sẽ tính theo role để tránh ép sai portal.
    let returnUrl = data.returnUrl || '/';

    const roles: string[] = data?.user?.roles ?? [];

    if (roles.includes('SUPERADMIN') || roles.includes('ADMIN')) {
      returnUrl = '/admin';
    } else if (roles.includes('MODERATOR')) {
      returnUrl = '/moderator';
    } else if (roles.includes('USER') || roles.length === 0) {
      returnUrl = '/auth/forbidden';
    }

    // (optional) chặn open-redirect: chỉ cho phép path nội bộ
    if (!returnUrl.startsWith('/') || returnUrl.startsWith('//')) {
      returnUrl =
        roles.includes('SUPERADMIN') || roles.includes('ADMIN')
          ? '/admin'
          : roles.includes('MODERATOR')
            ? '/moderator'
            : '/auth/forbidden';
    }

    // Redirect về trang callback với tokens trong fragment
    const callbackUrl = new URL('/auth/callback', request.url);
    // ✅ thêm user vào hash (encode JSON)
    const userStr = encodeURIComponent(JSON.stringify(data.user));

    callbackUrl.hash =
      `access_token=${encodeURIComponent(data.accessToken)}` +
      `&refresh_token=${encodeURIComponent(data.refreshToken)}` +
      `&expires_at=${encodeURIComponent(data.expiresAt || '')}` +
      `&return_url=${encodeURIComponent(returnUrl)}` +
      `&user=${userStr}`;

    return NextResponse.redirect(callbackUrl.toString());
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(error.message || 'system_error')}`,
        request.url
      )
    );
  }
}
