
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
//     console.log('Backend URL:', backendUrl);
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
//     console.log('OAuth callback response data:', data);

//     if (!response.ok || !data.success) {
//       return NextResponse.redirect(
//         new URL(`/authenticate/login?error=${encodeURIComponent(data.message || 'oauth_failed')}`, request.url)
//       );
//     }

//     // Lấy returnUrl từ state hoặc mặc định
//     const returnUrl = data.returnUrl || '/dashboard';
//     console.log('Return URL:', returnUrl);

//     // Redirect về trang callback với tokens trong fragment
//     const callbackUrl = new URL('/auth/callback', request.url);
//     console.log('Callback URL before adding hash:', callbackUrl.toString());
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
//     console.log("Backend URL:", backendBase);

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

//     console.log("OAuth callback response raw:", text);
//     console.log("OAuth callback response data:", data);

//     if (!response.ok || !data?.success) {
//       const msg = data?.message || `oauth_failed_${response.status}`;
//       return NextResponse.redirect(
//         new URL(`${LOGIN_PATH}?error=${encodeURIComponent(msg)}`, request.url)
//       );
//     }

//     const returnUrl = safeReturnUrl(data.returnUrl);
//     console.log("Return URL:", returnUrl);

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    // ✅ /login -> /authenticate/login
    return NextResponse.redirect(
      new URL('/authenticate/login?error=missing_params', request.url)
    );
  }

  try {
    // Gọi backend API để đổi code lấy tokens
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7097';
    console.log('Backend URL:', backendUrl);

    const response = await fetch(
      `${backendUrl}/auth/google/callback?code=${encodeURIComponent(
        code
      )}&state=${encodeURIComponent(state)}`,
      {
        method: 'GET',
        headers: {
          // ✅ Bỏ Content-Type cho GET, thay bằng Accept
          Accept: 'application/json',
        },
      }
    );

  const data = await response.json();
    console.log('OAuth callback response data:', data);

    if (!response.ok || !data.success) {
      return NextResponse.redirect(
        new URL(`/authenticate/login?error=${encodeURIComponent(data.message || 'oauth_failed')}`, request.url)
      );
    }

    // Lấy returnUrl từ state hoặc mặc định
    // Lấy returnUrl từ BE hoặc mặc định (nhưng ưu tiên theo role)
let returnUrl = data.returnUrl || '/dashboard';

const roles: string[] = data?.user?.roles ?? [];

if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) returnUrl = '/admin';
else if (roles.includes('AUTHORITY')) returnUrl = '/authority';

// (optional) chặn open-redirect: chỉ cho phép path nội bộ
if (!returnUrl.startsWith('/') || returnUrl.startsWith('//')) returnUrl = '/admin';

console.log('Return URL:', returnUrl);


    // Redirect về trang callback với tokens trong fragment
    const callbackUrl = new URL('/auth/callback', request.url);
    console.log('Callback URL before adding hash:', callbackUrl.toString());
// ✅ thêm user vào hash (encode JSON)
const userStr = encodeURIComponent(JSON.stringify(data.user));

callbackUrl.hash =
  `access_token=${encodeURIComponent(data.accessToken)}` +
  `&refresh_token=${encodeURIComponent(data.refreshToken)}` +
  `&return_url=${encodeURIComponent(returnUrl)}` +
  `&user=${userStr}`;


   return NextResponse.redirect(callbackUrl.toString());
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/authenticate/login?error=${encodeURIComponent(error.message || 'system_error')}`, request.url)
    );
  }
}
