// features/stations/api/stations.api.ts

import type {
  GetStationByIdResponse,
  GetStationsResponse,
  StationListFilters
} from '../types/station.type';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://fda.id.vn';

const API_PREFIX = `${API_BASE_URL}/stations`;

const ENDPOINTS = {
  list: `${API_PREFIX}/stations`,
  byId: (id: string) => `${API_PREFIX}/station/${id}`
};

type HttpMethod = 'GET';

class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function buildQuery(params: Record<string, any>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

async function fetchJson<T>(
  url: string,
  method: HttpMethod,
  body?: unknown
): Promise<T> {
  const hasBody = body !== undefined && body !== null;

  const res = await fetch(url, {
    method,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {})
    },
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

export const stationsApi = {
  async getStations(filters: StationListFilters): Promise<GetStationsResponse> {
    const qs = buildQuery({
      page: filters.page,
      perPage: filters.perPage,
      name: filters.name
    });

    return fetchJson<GetStationsResponse>(`${ENDPOINTS.list}${qs}`, 'GET');
  },

  async getStationById(id: string): Promise<GetStationByIdResponse> {
    return fetchJson<GetStationByIdResponse>(ENDPOINTS.byId(id), 'GET');
  }
};

export { ApiError };
