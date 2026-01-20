import { apiFetch } from '@/lib/api/client';
import type {
  GetFloodHistoryParams,
  GetFloodHistoryResponse,
  GetFloodStatisticsParams,
  GetFloodStatisticsResponse,
  GetFloodTrendsParams,
  GetFloodTrendsResponse
} from '../types/flood-history.type';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fda.id.vn/api/v1';

const ENDPOINTS = {
  history: `${API_BASE_URL}/flood-history`,
  trends: `${API_BASE_URL}/flood-trends`,
  statistics: `${API_BASE_URL}/flood-statistics`
};

const toIsoString = (value?: string | Date | null) => {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
};

const appendQueryParam = (
  params: URLSearchParams,
  key: string,
  value?: string | number | boolean | null
) => {
  if (value === undefined || value === null || value === '') return;
  params.set(key, String(value));
};

const buildQueryString = (query: URLSearchParams) => {
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

const toApiPath = (url: string) => {
  if (url.startsWith(API_BASE_URL)) {
    return url.slice(API_BASE_URL.length);
  }
  return url;
};

export function getFloodHistoryApi(params: GetFloodHistoryParams) {
  const query = new URLSearchParams();
  appendQueryParam(query, 'stationId', params.stationId ?? undefined);
  if (params.stationIds && params.stationIds.length > 0) {
    appendQueryParam(query, 'stationIds', params.stationIds.join(','));
  }
  appendQueryParam(query, 'areaId', params.areaId ?? undefined);
  appendQueryParam(query, 'startDate', toIsoString(params.startDate));
  appendQueryParam(query, 'endDate', toIsoString(params.endDate));
  appendQueryParam(query, 'granularity', params.granularity ?? undefined);
  appendQueryParam(query, 'limit', params.limit ?? undefined);
  appendQueryParam(query, 'cursor', params.cursor ?? undefined);

  const url = `${ENDPOINTS.history}${buildQueryString(query)}`;
  return apiFetch<GetFloodHistoryResponse>(toApiPath(url), { method: 'GET' });
}

export function getFloodTrendsApi(params: GetFloodTrendsParams) {
  const query = new URLSearchParams();
  appendQueryParam(query, 'stationId', params.stationId);
  appendQueryParam(query, 'period', params.period ?? undefined);
  appendQueryParam(query, 'startDate', toIsoString(params.startDate));
  appendQueryParam(query, 'endDate', toIsoString(params.endDate));
  appendQueryParam(query, 'granularity', params.granularity ?? undefined);
  appendQueryParam(
    query,
    'compareWithPrevious',
    params.compareWithPrevious ?? undefined
  );

  const url = `${ENDPOINTS.trends}${buildQueryString(query)}`;
  return apiFetch<GetFloodTrendsResponse>(toApiPath(url), { method: 'GET' });
}

export function getFloodStatisticsApi(params: GetFloodStatisticsParams) {
  const query = new URLSearchParams();
  appendQueryParam(query, 'stationId', params.stationId ?? undefined);
  if (params.stationIds && params.stationIds.length > 0) {
    appendQueryParam(query, 'stationIds', params.stationIds.join(','));
  }
  appendQueryParam(query, 'areaId', params.areaId ?? undefined);
  appendQueryParam(query, 'period', params.period ?? undefined);
  appendQueryParam(
    query,
    'includeBreakdown',
    params.includeBreakdown ?? undefined
  );

  const url = `${ENDPOINTS.statistics}${buildQueryString(query)}`;
  return apiFetch<GetFloodStatisticsResponse>(toApiPath(url), {
    method: 'GET'
  });
}
