import { apiFetch } from '@/libs/api/client';
import { getPublicApiBaseUrl } from '@/libs/env';
import type {
  CommunityFloodReport,
  CommunityFloodReportMedia,
  CommunityFloodReportsQuery,
  CommunityFloodReportsResponse
} from '../types/community-report.type';

const API_BASE = getPublicApiBaseUrl();

function pick<T = unknown>(
  raw: Record<string, unknown>,
  ...keys: string[]
): T | undefined {
  for (const key of keys) {
    const value = raw[key];
    if (value !== undefined && value !== null) return value as T;
  }
  return undefined;
}

function str(raw: Record<string, unknown>, ...keys: string[]): string {
  const value = pick<string>(raw, ...keys);
  if (value === undefined || value === null) return '';
  return String(value);
}

function num(raw: Record<string, unknown>, ...keys: string[]): number | null {
  const value = pick(raw, ...keys);
  if (value === undefined || value === null) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeMedia(raw: unknown): CommunityFloodReportMedia | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const id = str(row, 'id', 'Id');
  if (!id) return null;

  return {
    id,
    mediaType: pick(row, 'mediaType', 'MediaType') as string | null | undefined,
    mediaUrl: pick(row, 'mediaUrl', 'MediaUrl') as string | null | undefined,
    thumbnailUrl: pick(row, 'thumbnailUrl', 'ThumbnailUrl') as
      | string
      | null
      | undefined,
    createdAt: pick(row, 'createdAt', 'CreatedAt') as string | null | undefined
  };
}

export function normalizeCommunityFloodReport(
  raw: unknown
): CommunityFloodReport | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const id = str(row, 'id', 'Id');
  const latitude = num(row, 'latitude', 'Latitude');
  const longitude = num(row, 'longitude', 'Longitude');

  if (!id || latitude == null || longitude == null) return null;

  const reporterName =
    pick<string>(
      row,
      'reporterName',
      'ReporterName',
      'reporterFullName',
      'ReporterFullName',
      'reporterUserName',
      'ReporterUserName',
      'fullName',
      'FullName',
      'name',
      'Name'
    ) ?? null;

  const reporterEmail =
    pick<string>(
      row,
      'reporterEmail',
      'ReporterEmail',
      'reporterUserEmail',
      'ReporterUserEmail',
      'email',
      'Email'
    ) ?? null;

  const reporterObj = pick<unknown>(
    row,
    'reporter',
    'Reporter',
    'reporterUser',
    'ReporterUser'
  );

  const finalReporterName =
    reporterName ??
    (typeof reporterObj === 'object' && reporterObj
      ? (pick<string>(
          reporterObj as Record<string, unknown>,
          'fullName',
          'FullName',
          'name',
          'Name',
          'userName',
          'UserName',
          'username',
          'Username'
        ) ?? null)
      : null);

  const finalReporterEmail =
    reporterEmail ??
    (typeof reporterObj === 'object' && reporterObj
      ? (pick<string>(
          reporterObj as Record<string, unknown>,
          'email',
          'Email'
        ) ?? null)
      : null);

  return {
    id,
    reporterUserId: pick(
      row,
      'reporterUserId',
      'ReporterUserId',
      'reporterId',
      'ReporterId',
      'userId',
      'UserId',
      'reporter_id',
      'Reporter_id'
    ) as string | null | undefined,
    reporterName: finalReporterName,
    reporterEmail: finalReporterEmail,
    latitude,
    longitude,
    address: pick(row, 'address', 'Address') as string | null | undefined,
    description: pick(row, 'description', 'Description') as
      | string
      | null
      | undefined,
    severity: pick(row, 'severity', 'Severity') as string | null | undefined,
    trustScore: num(row, 'trustScore', 'TrustScore'),
    score: num(row, 'score', 'Score'),
    status: pick(row, 'status', 'Status') as string | null | undefined,
    confidenceLevel: pick(row, 'confidenceLevel', 'ConfidenceLevel') as
      | string
      | number
      | null
      | undefined,
    priority: pick(row, 'priority', 'Priority') as string | null | undefined,
    createdAt: pick(row, 'createdAt', 'CreatedAt') as string | null | undefined,
    updatedAt: pick(row, 'updatedAt', 'UpdatedAt') as string | null | undefined,
    media: Array.isArray(pick(row, 'media', 'Media'))
      ? ((pick(row, 'media', 'Media') as unknown[])
          .map(normalizeMedia)
          .filter(Boolean) as CommunityFloodReportMedia[])
      : []
  };
}

function extractList(json: unknown): unknown[] {
  if (!json || typeof json !== 'object') return [];
  const root = json as Record<string, unknown>;
  if (Array.isArray(root)) return root;
  if (Array.isArray(root.data)) return root.data as unknown[];
  if (Array.isArray(root.reports)) return root.reports as unknown[];
  if (Array.isArray(root.items)) return root.items as unknown[];

  if (root.data && typeof root.data === 'object') {
    const data = root.data as Record<string, unknown>;
    if (Array.isArray(data.items)) return data.items as unknown[];
  }

  return [];
}

function buildCommunityReportsPath(
  params?: CommunityFloodReportsQuery
): string {
  const search = new URLSearchParams();

  if (params?.status != null) search.set('status', String(params.status));
  if (params?.severity != null) search.set('severity', String(params.severity));
  if (
    typeof params?.minTrustScore === 'number' &&
    Number.isFinite(params.minTrustScore)
  ) {
    search.set('minTrustScore', String(params.minTrustScore));
  }
  if (params?.from) search.set('from', params.from);
  if (params?.to) search.set('to', params.to);
  search.set('pageNumber', String(params?.pageNumber ?? 1));
  search.set('pageSize', String(params?.pageSize ?? 10));

  const queryString = search.toString();
  return `/flood-reports/community${queryString ? `?${queryString}` : ''}`;
}

function buildCommunityReportsUrl(params?: CommunityFloodReportsQuery): string {
  return `${API_BASE}${buildCommunityReportsPath(params)}`;
}

export async function fetchCommunityFloodReports(
  accessTokenOrParams?: string | CommunityFloodReportsQuery,
  maybeParams?: CommunityFloodReportsQuery
): Promise<CommunityFloodReport[]> {
  const accessToken =
    typeof accessTokenOrParams === 'string' ? accessTokenOrParams : undefined;
  const params =
    typeof accessTokenOrParams === 'string' ? maybeParams : accessTokenOrParams;
  const url = buildCommunityReportsUrl(params);
  const headers: Record<string, string> = {};

  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(`Community reports: ${response.status}`);
  }

  const json = await response.json().catch(() => null);
  return extractList(json)
    .map(normalizeCommunityFloodReport)
    .filter(Boolean) as CommunityFloodReport[];
}

export async function fetchCommunityFloodReportsPaged(
  params?: CommunityFloodReportsQuery
): Promise<CommunityFloodReportsResponse> {
  const response = await apiFetch<unknown>(buildCommunityReportsPath(params), {
    method: 'GET'
  });
  const items = extractList(response)
    .map(normalizeCommunityFloodReport)
    .filter(Boolean) as CommunityFloodReport[];

  const root =
    response && typeof response === 'object'
      ? (response as Record<string, unknown>)
      : {};

  const totalCount =
    num(root, 'totalCount', 'TotalCount') ??
    (root.data && typeof root.data === 'object'
      ? num(root.data as Record<string, unknown>, 'totalCount', 'TotalCount')
      : null) ??
    items.length;

  return {
    success: Boolean((root.success as boolean | undefined) ?? true),
    message: String((root.message as string | undefined) ?? ''),
    totalCount,
    items
  };
}

export async function hideCommunityFloodReport(reportId: string) {
  return apiFetch(`/admin/flood-reports/${reportId}/hide`, {
    method: 'PATCH'
  });
}
