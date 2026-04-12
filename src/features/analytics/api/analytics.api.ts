import { getAccessToken } from '@/libs/auth-utils';
import type {
  AggregateFrequencyApiBody,
  AggregateHotspotsApiBody,
  AggregateSeverityApiBody,
  FrequencyAggregationRequest,
  HotspotAggregationRequest,
  SeverityAggregationRequest
} from '../types/analytics.types';
import type {
  FrequencyAnalyticsResponse,
  HotspotRankingsResponse,
  JobStatusResponse,
  SeverityAnalyticsResponse
} from '../types/analytics.dashboard.types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fda.id.vn/api/v1';

const ENDPOINTS = {
  frequency: `${API_BASE_URL}/analytics/frequency/aggregate`,
  severity: `${API_BASE_URL}/analytics/severity/aggregate`,
  hotspots: `${API_BASE_URL}/analytics/hotspots/aggregate`,
  hotspotRankings: `${API_BASE_URL}/analytics/hotspots`,
  frequencyAnalytics: `${API_BASE_URL}/analytics/frequency`,
  severityAnalytics: `${API_BASE_URL}/analytics/severity`,
  jobStatus: `${API_BASE_URL}/analytics/jobs`
};

export class AnalyticsApiError extends Error {
  status: number;
  payload?: unknown;
  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'AnalyticsApiError';
    this.status = status;
    this.payload = payload;
  }
}

function extractErrorMessage(data: unknown, status: number): string {
  if (data == null) return `Request failed (${status})`;
  if (typeof data === 'string') {
    const t = data.trim();
    return t || `Request failed (${status})`;
  }
  if (typeof data !== 'object') return `Request failed (${status})`;

  const o = data as Record<string, unknown>;
  if (typeof o.message === 'string' && o.message.trim()) return o.message;

  const title = typeof o.title === 'string' ? o.title.trim() : '';
  const detail = typeof o.detail === 'string' ? o.detail.trim() : '';
  if (title && detail) return `${title}: ${detail}`;
  if (detail) return detail;
  if (title) return title;

  const errors = o.errors;
  if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
    const parts: string[] = [];
    for (const [k, v] of Object.entries(errors as Record<string, unknown>)) {
      if (Array.isArray(v))
        parts.push(
          `${k}: ${v.filter((x) => typeof x === 'string').join(', ')}`
        );
      else if (typeof v === 'string') parts.push(`${k}: ${v}`);
    }
    if (parts.length) return parts.join(' | ');
  }

  try {
    return JSON.stringify(data);
  } catch {
    return `Request failed (${status})`;
  }
}

async function postJson<T>(
  url: string,
  body: unknown,
  accessToken?: string
): Promise<T> {
  let token = accessToken;
  if (!token) {
    const t = await getAccessToken();
    token = t ?? undefined;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store'
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const msg = extractErrorMessage(data, res.status);
    throw new AnalyticsApiError(msg, res.status, data);
  }

  return data as T;
}

async function getJson<T>(url: string, accessToken?: string): Promise<T> {
  let token = accessToken;
  if (!token) {
    const t = await getAccessToken();
    token = t ?? undefined;
  }

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'GET',
    headers,
    cache: 'no-store'
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const msg = extractErrorMessage(data, res.status);
    throw new AnalyticsApiError(msg, res.status, data);
  }

  return data as T;
}

/** GET /analytics/frequency|severity — BE UAT dùng dd-MM-yyyy trong query. */
function toQueryDateDdMmYyyy(yyyyMmDd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd.trim());
  if (!m) return yyyyMmDd;
  const [, y, mo, d] = m;
  return `${d}-${mo}-${y}`;
}

function toAreaIds(
  administrativeAreaIds: string[]
): string[] | null | undefined {
  if (!administrativeAreaIds.length) return null;
  return administrativeAreaIds;
}

export const analyticsApi = {
  async triggerFrequencyAggregation(
    payload: FrequencyAggregationRequest,
    accessToken?: string
  ) {
    const body: AggregateFrequencyApiBody = {
      bucketType: payload.bucketType,
      startDate: payload.startDate,
      endDate: payload.endDate,
      areaIds: toAreaIds(payload.administrativeAreaIds)
    };
    return postJson(ENDPOINTS.frequency, body, accessToken);
  },

  async triggerSeverityAggregation(
    payload: SeverityAggregationRequest,
    accessToken?: string
  ) {
    const body: AggregateSeverityApiBody = {
      bucketType: payload.bucketType,
      startDate: payload.startDate,
      endDate: payload.endDate,
      areaIds: toAreaIds(payload.administrativeAreaIds)
    };
    return postJson(ENDPOINTS.severity, body, accessToken);
  },

  async triggerHotspotAggregation(
    payload: HotspotAggregationRequest,
    accessToken?: string
  ) {
    const body: AggregateHotspotsApiBody = {
      periodStart: payload.periodStart,
      periodEnd: payload.periodEnd,
      topN: payload.topN
    };
    return postJson(ENDPOINTS.hotspots, body, accessToken);
  },

  async getHotspotRankings(
    params: {
      periodStart?: string;
      periodEnd?: string;
      topN?: number;
      /** BE bắt buộc ward | street */
      areaLevel: string;
    },
    accessToken?: string
  ): Promise<HotspotRankingsResponse> {
    const searchParams = new URLSearchParams();
    if (params.periodStart) searchParams.set('periodStart', params.periodStart);
    if (params.periodEnd) searchParams.set('periodEnd', params.periodEnd);
    if (typeof params.topN === 'number')
      searchParams.set('topN', String(params.topN));
    searchParams.set('areaLevel', params.areaLevel);

    const url =
      searchParams.size > 0
        ? `${ENDPOINTS.hotspotRankings}?${searchParams.toString()}`
        : ENDPOINTS.hotspotRankings;

    return getJson<HotspotRankingsResponse>(url, accessToken);
  },

  async getFrequencyAnalytics(
    params: {
      administrativeAreaId: string;
      bucketType: string;
      startDate?: string;
      endDate?: string;
    },
    accessToken?: string
  ): Promise<FrequencyAnalyticsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('administrativeAreaId', params.administrativeAreaId);
    searchParams.set('bucketType', params.bucketType);
    if (params.startDate)
      searchParams.set('startDate', toQueryDateDdMmYyyy(params.startDate));
    if (params.endDate)
      searchParams.set('endDate', toQueryDateDdMmYyyy(params.endDate));

    const url = `${ENDPOINTS.frequencyAnalytics}?${searchParams.toString()}`;
    return getJson<FrequencyAnalyticsResponse>(url, accessToken);
  },

  async getSeverityAnalytics(
    params: {
      administrativeAreaId: string;
      bucketType: string;
      startDate?: string;
      endDate?: string;
    },
    accessToken?: string
  ): Promise<SeverityAnalyticsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('administrativeAreaId', params.administrativeAreaId);
    searchParams.set('bucketType', params.bucketType);
    if (params.startDate)
      searchParams.set('startDate', toQueryDateDdMmYyyy(params.startDate));
    if (params.endDate)
      searchParams.set('endDate', toQueryDateDdMmYyyy(params.endDate));

    const url = `${ENDPOINTS.severityAnalytics}?${searchParams.toString()}`;
    return getJson<SeverityAnalyticsResponse>(url, accessToken);
  },

  async getJobStatus(
    jobRunId: string,
    accessToken?: string
  ): Promise<JobStatusResponse> {
    const base = `${ENDPOINTS.jobStatus}/${encodeURIComponent(jobRunId)}`;
    try {
      // Some backends expose /status; fall back to base if not found.
      return await getJson<JobStatusResponse>(`${base}/status`, accessToken);
    } catch (e) {
      if (e instanceof AnalyticsApiError && e.status === 404) {
        return getJson<JobStatusResponse>(base, accessToken);
      }
      throw e;
    }
  }
};
