export function getPublicApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!raw) {
    throw new Error(
      'Thiếu cấu hình NEXT_PUBLIC_API_BASE_URL. Vui lòng set biến môi trường để chạy ứng dụng.'
    );
  }
  return raw.replace(/\/$/, '');
}

export const isDev = process.env.NODE_ENV === 'development';

export function devLog(...args: unknown[]) {
  if (isDev) console.log(...args);
}

export function devWarn(...args: unknown[]) {
  if (isDev) console.warn(...args);
}
