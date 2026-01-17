// features/stations/api/stations.api.ts

import type {
  GetStationByIdResponse,
  GetStationsResponse,
  StationListFilters,
  Station,
  StationUpsertPayload,
  CreateStationResponse,
  UpdateStationResponse,
  DeleteStationResponse
} from '../types/station.type';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fda.id.vn/api/v1';
const API_PREFIX = `${API_BASE_URL}/stations`;

const ENDPOINTS = {
  list: `${API_PREFIX}/stations`,
  byId: (id: string) => `${API_PREFIX}/station/${id}`, // GET
  create: `${API_PREFIX}/station`, // POST
  update: (id: string) => `${API_PREFIX}/station/${id}`, // PUT (full body)
  delete: (id: string) => `${API_PREFIX}/station/${id}` // DELETE
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

function buildQuery(params: Record<string, any>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

type FetchJsonOptions = {
  accessToken?: string; // optional auth
};

async function fetchJson<T>(
  url: string,
  method: HttpMethod,
  body?: unknown,
  opts?: FetchJsonOptions
): Promise<T> {
  const hasBody = body !== undefined && body !== null;

  const headers: Record<string, string> = {};
  if (hasBody) headers['Content-Type'] = 'application/json';
  if (opts?.accessToken)
    headers['Authorization'] = `Bearer ${opts.accessToken}`;

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

/**
 * Helper để build payload update "FULL fields" đúng yêu cầu backend:
 * - không cho update thiếu code/name/status...
 * - đảm bảo luôn gửi đủ field chuẩn StationUpsertPayload
 */
function buildFullUpdatePayload(
  station: Station,
  patch: Partial<StationUpsertPayload>
): StationUpsertPayload {
  return {
    code: patch.code ?? station.code,
    name: patch.name ?? station.name,
    locationDesc: patch.locationDesc ?? station.locationDesc ?? null,
    latitude: patch.latitude ?? station.latitude,
    longitude: patch.longitude ?? station.longitude,
    roadName: patch.roadName ?? station.roadName ?? null,
    direction: patch.direction ?? station.direction ?? null,
    status: patch.status ?? station.status,
    thresholdWarning:
      patch.thresholdWarning ?? station.thresholdWarning ?? null,
    thresholdCritical:
      patch.thresholdCritical ?? station.thresholdCritical ?? null,
    installedAt: patch.installedAt ?? station.installedAt ?? null,
    lastSeenAt: patch.lastSeenAt ?? station.lastSeenAt ?? null
  };
}

export const stationsApi = {
  // LIST (hiện tại bạn đang tạm không query)
  async getStations(filters: StationListFilters): Promise<GetStationsResponse> {
    // Build query string with filters
    const queryParams: Record<string, any> = {};
    if (filters.name) queryParams.searchTerm = filters.name;
    if (filters.status) queryParams.status = filters.status;
    if (filters.page) queryParams.pageNumber = filters.page;
    if (filters.perPage) queryParams.pageSize = filters.perPage;

    const qs = buildQuery(queryParams);
    return fetchJson<GetStationsResponse>(`${ENDPOINTS.list}${qs}`, 'GET');
  },

  // GET BY ID
  async getStationById(id: string): Promise<GetStationByIdResponse> {
    return fetchJson<GetStationByIdResponse>(ENDPOINTS.byId(id), 'GET');
  },

  // CREATE
  async createStation(
    payload: StationUpsertPayload,
    accessToken?: string
  ): Promise<CreateStationResponse> {
    return fetchJson<CreateStationResponse>(ENDPOINTS.create, 'POST', payload, {
      accessToken
    });
  },

  /**
   * UPDATE (PUT full body)
   * - Nếu bạn đã có full payload -> dùng updateStationFull
   * - Nếu bạn chỉ có patch -> dùng updateStationFromExisting (will GET station first để build full body)
   */
  async updateStationFull(
    id: string,
    payload: StationUpsertPayload,
    accessToken?: string
  ): Promise<UpdateStationResponse> {
    return fetchJson<UpdateStationResponse>(
      ENDPOINTS.update(id),
      'PUT',
      payload,
      { accessToken }
    );
  },

  async updateStationFromExisting(
    id: string,
    patch: Partial<StationUpsertPayload>,
    accessToken?: string
  ): Promise<UpdateStationResponse> {
    // fetch current station first
    const current = await fetchJson<GetStationByIdResponse>(
      ENDPOINTS.byId(id),
      'GET',
      undefined,
      { accessToken }
    );
    const fullPayload = buildFullUpdatePayload(current.station, patch);
    return fetchJson<UpdateStationResponse>(
      ENDPOINTS.update(id),
      'PUT',
      fullPayload,
      { accessToken }
    );
  },

  // DELETE
  async deleteStation(
    id: string,
    accessToken?: string
  ): Promise<DeleteStationResponse> {
    return fetchJson<DeleteStationResponse>(
      ENDPOINTS.delete(id),
      'DELETE',
      undefined,
      { accessToken }
    );
  }
};
