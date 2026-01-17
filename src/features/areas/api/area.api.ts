// features/areas/api/area.api.ts

import type {
  GetAreasResponse,
  GetAreaByIdResponse,
  AreaListFilters
} from '../types/area.type';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fda.id.vn/api/v1';

const API_PREFIX = `${API_BASE_URL}/areas`;

const ENDPOINTS = {
  list: `${API_PREFIX}/areas`,
  byId: (id: string) => `${API_PREFIX}/${id}`
};

type HttpMethod = 'GET';

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
  accessToken?: string
): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(url, {
    method,
    headers,
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

export const areasApi = {
  async getAreas(_: AreaListFilters): Promise<GetAreasResponse> {
    // Backend chưa support filter → call thẳng
    return fetchJson<GetAreasResponse>(ENDPOINTS.list, 'GET');
  },

  async getAreaById(
    id: string,
    accessToken: string
  ): Promise<GetAreaByIdResponse> {
    return fetchJson<GetAreaByIdResponse>(
      ENDPOINTS.byId(id),
      'GET',
      accessToken
    );
  }
};
