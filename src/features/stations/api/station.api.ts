// features/stations/api/stations.api.ts

import type {
  GetStationByIdResponse,
  GetStationsResponse,
  StationListFilters,
  Station,
  StationUpsertPayload,
  CreateStationResponse,
  UpdateStationResponse,
  DeleteStationResponse,
  ComponentUpsertPayload,
  GetComponentsResponse,
  GetComponentByIdResponse,
  CreateComponentResponse,
  UpdateComponentResponse,
  DeleteComponentResponse,
  GetCalibrationResponse,
  UpdateCalibrationResponse,
  GetStationStatusResponse,
  GetOnlineStationsResponse,
  GetOfflineStationsResponse
} from '../types/station.type';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import { getPublicApiBaseUrl } from '@/libs/env';

const API_BASE_URL = getPublicApiBaseUrl();
const API_PREFIX = `${API_BASE_URL}/stations`;

const ENDPOINTS = {
  list: `${API_PREFIX}/stations`,
  byId: (id: string) => `${API_PREFIX}/station/${id}`,
  create: `${API_PREFIX}/station`,
  update: (id: string) => `${API_PREFIX}/station/${id}`,
  delete: (id: string) => `${API_PREFIX}/station/${id}`,
  statusById: (id: string) => `${API_PREFIX}/${id}/status`,
  onlineStations: `${API_PREFIX}/status/online`,
  offlineStations: `${API_PREFIX}/status/offline`
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
    if (res.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') window.location.href = '/auth/login';
    } else if (res.status === 403) {
      toast.error('Không đủ quyền');
    }
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
    calibrationOffset:
      patch.calibrationOffset ?? station.calibrationOffset ?? null,
    installedAt: patch.installedAt ?? station.installedAt ?? null,
    lastSeenAt: patch.lastSeenAt ?? station.lastSeenAt ?? null
  };
}

export const stationsApi = {
  // LIST (hiện tại bạn đang tạm không query)
  async getStations(
    filters: StationListFilters,
    accessToken?: string
  ): Promise<GetStationsResponse> {
    // Build query string with filters
    const queryParams: Record<string, any> = {};
    if (filters.searchTerm) queryParams.searchTerm = filters.searchTerm;
    else if (filters.name) queryParams.searchTerm = filters.name;
    if (filters.status) queryParams.status = filters.status;
    if (filters.page) queryParams.pageNumber = filters.page;
    if (filters.perPage) queryParams.pageSize = filters.perPage;

    const qs = buildQuery(queryParams);
    return fetchJson<GetStationsResponse>(
      `${ENDPOINTS.list}${qs}`,
      'GET',
      undefined,
      {
        accessToken
      }
    );
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
  },

  // ============================================================
  // Station Status APIs (FE-32)
  // URL: /api/v1/stations/{id}/status
  // ============================================================

  async getStationStatus(
    stationId: string,
    accessToken?: string
  ): Promise<GetStationStatusResponse> {
    return fetchJson<GetStationStatusResponse>(
      ENDPOINTS.statusById(stationId),
      'GET',
      undefined,
      { accessToken }
    );
  },

  async getOnlineStations(
    accessToken?: string
  ): Promise<GetOnlineStationsResponse> {
    return fetchJson<GetOnlineStationsResponse>(
      ENDPOINTS.onlineStations,
      'GET',
      undefined,
      { accessToken }
    );
  },

  async getOfflineStations(
    accessToken?: string
  ): Promise<GetOfflineStationsResponse> {
    return fetchJson<GetOfflineStationsResponse>(
      ENDPOINTS.offlineStations,
      'GET',
      undefined,
      { accessToken }
    );
  },

  // ============================================================
  // Calibration APIs (FE-33)
  // URL: /api/v1/stations/{stationId}/calibration
  // ============================================================

  async getCalibration(
    stationId: string,
    accessToken?: string
  ): Promise<GetCalibrationResponse> {
    return fetchJson<GetCalibrationResponse>(
      `${API_PREFIX}/${stationId}/calibration`,
      'GET',
      undefined,
      { accessToken }
    );
  },

  async updateCalibration(
    stationId: string,
    calibrationOffset: number,
    accessToken?: string
  ): Promise<UpdateCalibrationResponse> {
    return fetchJson<UpdateCalibrationResponse>(
      `${API_PREFIX}/${stationId}/calibration`,
      'PUT',
      { calibrationOffset },
      { accessToken }
    );
  },

  // ============================================================
  // Component APIs (FE-31)
  // URL: /api/v1/stations/{stationId}/components
  // ============================================================

  async getComponents(
    stationId: string,
    accessToken?: string
  ): Promise<GetComponentsResponse> {
    return fetchJson<GetComponentsResponse>(
      `${API_PREFIX}/${stationId}/components`,
      'GET',
      undefined,
      { accessToken }
    );
  },

  async getComponentById(
    stationId: string,
    componentId: string,
    accessToken?: string
  ): Promise<GetComponentByIdResponse> {
    return fetchJson<GetComponentByIdResponse>(
      `${API_PREFIX}/${stationId}/components/${componentId}`,
      'GET',
      undefined,
      { accessToken }
    );
  },

  async createComponent(
    stationId: string,
    payload: ComponentUpsertPayload,
    accessToken?: string
  ): Promise<CreateComponentResponse> {
    return fetchJson<CreateComponentResponse>(
      `${API_PREFIX}/${stationId}/components`,
      'POST',
      payload,
      { accessToken }
    );
  },

  async updateComponent(
    stationId: string,
    componentId: string,
    payload: ComponentUpsertPayload,
    accessToken?: string
  ): Promise<UpdateComponentResponse> {
    return fetchJson<UpdateComponentResponse>(
      `${API_PREFIX}/${stationId}/components/${componentId}`,
      'PUT',
      payload,
      { accessToken }
    );
  },

  async deleteComponent(
    stationId: string,
    componentId: string,
    accessToken?: string
  ): Promise<DeleteComponentResponse> {
    return fetchJson<DeleteComponentResponse>(
      `${API_PREFIX}/${stationId}/components/${componentId}`,
      'DELETE',
      undefined,
      { accessToken }
    );
  }
};
