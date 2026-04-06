import type {
  GetAdminComplaintsResponse,
  ResolveComplaintPayload,
  ResolveComplaintResponse
} from '../types/subscription-dispute.type';
import { getAccessToken } from '@/libs/auth-utils';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fda.id.vn/api/v1';

const ENDPOINTS = {
  adminComplaints: `${API_BASE_URL}/admin/complaints`,
  resolveComplaint: (id: string) =>
    `${API_BASE_URL}/admin/complaints/${id}/resolve`
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
  if (resolvedAccessToken) {
    headers['Authorization'] = `Bearer ${resolvedAccessToken}`;
  }

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

export const subscriptionDisputeApi = {
  async getAdminComplaints(
    params: { page: number; pageSize: number; status?: string },
    accessToken?: string
  ): Promise<GetAdminComplaintsResponse> {
    const urlParams = new URLSearchParams();
    urlParams.set('page', String(params.page));
    urlParams.set('pageSize', String(params.pageSize));
    if (params.status) urlParams.set('status', params.status);

    const url = `${ENDPOINTS.adminComplaints}?${urlParams.toString()}`;

    return fetchJson<GetAdminComplaintsResponse>(
      url,
      'GET',
      undefined,
      accessToken
    );
  },

  async resolveComplaint(
    id: string,
    payload: ResolveComplaintPayload,
    accessToken?: string
  ): Promise<ResolveComplaintResponse> {
    return fetchJson<ResolveComplaintResponse>(
      ENDPOINTS.resolveComplaint(id),
      'PUT',
      payload,
      accessToken
    );
  }
};
