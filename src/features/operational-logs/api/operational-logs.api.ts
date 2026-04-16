import { apiFetch } from '@/libs/api/client';
import type { OperationalLogsQueryParams } from '../types/operational-log-filters.type';
import type {
  ApiWrapper,
  OperationalLogDetailResult,
  OperationalLogListItem,
  PaginatedData
} from '../types/operational-log.type';

function setIfPresent(params: URLSearchParams, key: string, value: unknown) {
  if (value === undefined || value === null || value === '') return;
  params.set(key, String(value));
}

function buildLogsQuery(params?: OperationalLogsQueryParams) {
  const q = new URLSearchParams();

  setIfPresent(q, 'category', params?.category);
  setIfPresent(q, 'action', params?.action);
  setIfPresent(q, 'level', params?.level);
  setIfPresent(q, 'userId', params?.userId);
  setIfPresent(q, 'entityId', params?.entityId);
  setIfPresent(q, 'entityType', params?.entityType);
  setIfPresent(q, 'fromDate', params?.fromDate);
  setIfPresent(q, 'toDate', params?.toDate);
  setIfPresent(q, 'searchText', params?.searchText);

  setIfPresent(q, 'page', params?.page ?? 1);
  setIfPresent(q, 'pageSize', params?.pageSize ?? 50);
  setIfPresent(q, 'orderBy', params?.orderBy ?? 'CreatedAt');
  setIfPresent(q, 'orderDescending', params?.orderDescending ?? true);

  return q;
}

export async function getOperationalLogs(params?: OperationalLogsQueryParams) {
  const q = buildLogsQuery(params);
  return apiFetch<ApiWrapper<PaginatedData<OperationalLogListItem>>>(
    `/admin/logs?${q.toString()}`,
    { method: 'GET' }
  );
}

export async function getOperationalLogDetail(
  id: string
): Promise<OperationalLogDetailResult> {
  // Detail endpoint có case 404 body rỗng -> phải handle trước khi parse JSON
  try {
    const res = await apiFetch<ApiWrapper<any>>(`/admin/logs/${id}`, {
      method: 'GET'
    });
    return { notFound: false, data: res.data };
  } catch (e: any) {
    // apiFetch throw ApiError {status}
    const status = Number(e?.status ?? e?.response?.status ?? NaN);
    if (status === 404) return { notFound: true };
    throw e;
  }
}

export async function exportOperationalLogs(args: {
  format: 'csv' | 'json';
  params?: OperationalLogsQueryParams;
}) {
  const q = buildLogsQuery(args.params);
  q.set('format', args.format);

  return apiFetch<ApiWrapper<string>>(`/admin/logs/export?${q.toString()}`, {
    method: 'GET'
  });
}
