/**
 * Hangfire dashboard (thường cùng origin với API, path `/hangfire/`).
 * Override: NEXT_PUBLIC_HANGFIRE_URL=https://uat.fda.id.vn/hangfire/
 */
export function getHangfireDashboardUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_HANGFIRE_URL?.trim();
  if (explicit) {
    return explicit.endsWith('/') ? explicit : `${explicit}/`;
  }

  const api = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (api) {
    try {
      const { origin } = new URL(api);
      return `${origin}/hangfire/`;
    } catch {
      /* ignore */
    }
  }

  return 'https://uat.fda.id.vn/hangfire/';
}
