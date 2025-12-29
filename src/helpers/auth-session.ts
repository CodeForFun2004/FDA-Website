// src/helper/auth-session.ts

export const SESSION_COOKIE_NAME = "fda_session";

// set cookie session (client-only)
export function setSessionCookie(days = 7, value = "1") {
  const maxAge = 60 * 60 * 24 * days;
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(
    value
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

// remove cookie session (client-only) - dùng cho logout
export function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
