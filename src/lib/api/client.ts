import { useAuthStore } from "@/stores/auth-store";

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL; // https://fda.id.vn/api/v1

type ApiOptions = RequestInit & { auth?: boolean };

function isFormData(body: any): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  if (!BASE) throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");

  const url = `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const needAuth = options.auth !== false;
  const token = needAuth ? useAuthStore.getState().accessToken : null;

  // Build headers safely
  const headers = new Headers(options.headers ?? {});

  // ✅ Only set JSON content-type when body is NOT FormData AND caller hasn't set it
  if (!isFormData(options.body)) {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  } else {
    // ✅ Let browser set boundary for multipart
    headers.delete("Content-Type");
  }

  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const msg =
      (typeof data === "object" &&
        data &&
        "message" in (data as any) &&
        String((data as any).message)) ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}
