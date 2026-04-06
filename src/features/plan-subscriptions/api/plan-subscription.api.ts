// features/plan-subscriptions/api/plan-subscription.api.ts

import type {
  GetPlansResponse,
  CreatePlanResponse,
  UpdatePlanResponse,
  DeactivatePlanResponse,
  CreatePlanPayload,
  UpdatePlanPayload
} from '../types/plan-subscription.type';
import { getAccessToken } from '@/libs/auth-utils';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fda.id.vn/api/v1';

const ENDPOINTS = {
  list: `${API_BASE_URL}/admin/plans`,
  byId: (id: string) => `${API_BASE_URL}/admin/plans/${id}`
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

  console.log('\n================ API DEBUG ================');
  console.log('[fetchJson] request:', {
    url,
    method,
    hasBody,
    hasAccessToken: !!resolvedAccessToken,
    headers
  });

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

  console.log('[fetchJson] response meta:', {
    status: res.status,
    ok: res.ok,
    contentType
  });
  console.log('[fetchJson] raw response body:', data);

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error || data.msg)) ||
      `Request failed (${res.status})`;

    console.error('[fetchJson] request failed:', {
      status: res.status,
      message: msg,
      payload: data
    });
    console.log('==========================================\n');

    throw new ApiError(msg, res.status, data);
  }

  console.log('[fetchJson] request success');
  console.log('==========================================\n');

  return data as T;
}

export const planSubscriptionApi = {
  /** GET /api/v1/admin/plans */
  async getPlans(accessToken?: string): Promise<GetPlansResponse> {
    return fetchJson<GetPlansResponse>(
      ENDPOINTS.list,
      'GET',
      undefined,
      accessToken
    );
  },

  /** POST /api/v1/admin/plans */
  async createPlan(
    payload: CreatePlanPayload,
    accessToken?: string
  ): Promise<CreatePlanResponse> {
    return fetchJson<CreatePlanResponse>(
      ENDPOINTS.list,
      'POST',
      payload,
      accessToken
    );
  },

  /** PUT /api/v1/admin/plans/{id} */
  async updatePlan(
    id: string,
    payload: UpdatePlanPayload,
    accessToken?: string
  ): Promise<UpdatePlanResponse> {
    return fetchJson<UpdatePlanResponse>(
      ENDPOINTS.byId(id),
      'PUT',
      payload,
      accessToken
    );
  },

  /** DELETE /api/v1/admin/plans/{id} (soft deactivate) */
  async deactivatePlan(
    id: string,
    accessToken?: string
  ): Promise<DeactivatePlanResponse> {
    return fetchJson<DeactivatePlanResponse>(
      ENDPOINTS.byId(id),
      'DELETE',
      undefined,
      accessToken
    );
  }
};
