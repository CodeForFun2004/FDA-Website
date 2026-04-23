import type { GetAdminPaymentsResponse } from '../types/billing-payment.type';
import { getAccessToken } from '@/libs/auth-utils';
import { getPublicApiBaseUrl } from '@/libs/env';

const API_BASE_URL = getPublicApiBaseUrl();

const ENDPOINTS = {
  adminPayments: `${API_BASE_URL}/admin/payments`
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function fetchJson<T>(
  url: string,
  method: HttpMethod,
  body?: unknown,
  accessToken?: string
): Promise<T> {
  const hasBody = body !== undefined && body !== null;

  let resolvedAccessToken: string | undefined = accessToken;
  if (!resolvedAccessToken) {
    const tokenFromStore = await getAccessToken();
    resolvedAccessToken = tokenFromStore ?? undefined;
  }

  const headers: Record<string, string> = {};
  if (hasBody) headers['Content-Type'] = 'application/json';
  if (resolvedAccessToken)
    headers['Authorization'] = `Bearer ${resolvedAccessToken}`;

  const res = await fetch(url, {
    method,
    headers,
    body: hasBody ? JSON.stringify(body) : undefined,
    cache: 'no-store'
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error || data.msg)) ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}

export const billingPaymentApi = {
  async getAdminPayments(
    params: { page: number; pageSize: number; status?: string },
    accessToken?: string
  ): Promise<GetAdminPaymentsResponse> {
    const sp = new URLSearchParams();
    sp.set('page', String(params.page));
    sp.set('pageSize', String(params.pageSize));
    if (params.status) sp.set('status', params.status);

    const url = `${ENDPOINTS.adminPayments}?${sp.toString()}`;
    return fetchJson<GetAdminPaymentsResponse>(
      url,
      'GET',
      undefined,
      accessToken
    );
  }
};
