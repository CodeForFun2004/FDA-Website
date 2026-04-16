import { apiFetch } from '@/libs/api/client';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://fda.id.vn/api/v1';

export type CommunityFloodReportMedia = {
  id: string;
  mediaType?: string | null;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  createdAt?: string | null;
};

export type CommunityFloodReport = {
  id: string;
  reporterUserId?: string | null;
  reporterName?: string | null;
  reporterEmail?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  description?: string | null;
  severity?: string | null;
  trustScore?: number | null;
  score?: number | null;
  status?: string | null;
  confidenceLevel?: string | number | null;
  priority?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  media?: CommunityFloodReportMedia[];
};

export type CommunityFloodReportsQuery = {
  /** BE query dạng chuỗi (vd status=published|hidden) (có thể hỗ trợ cả code số). */
  status?: number | string | null;
  /** BE query dạng chuỗi (vd severity=low|medium|high) (có thể hỗ trợ cả code số). */
  severity?: number | string | null;
  minTrustScore?: number | null;
  from?: string | '';
  to?: string | '';
  pageNumber?: number;
  pageSize?: number;
};

export type CommunityFloodReportsResponse = {
  success: boolean;
  message: string;
  totalCount: number;
  items: CommunityFloodReport[];
};

function pick<T = unknown>(
  raw: Record<string, unknown>,
  ...keys: string[]
): T | undefined {
  for (const k of keys) {
    const v = raw[k];
    if (v !== undefined && v !== null) return v as T;
  }
  return undefined;
}

function str(raw: Record<string, unknown>, ...keys: string[]): string {
  const v = pick<string>(raw, ...keys);
  if (v === undefined || v === null) return '';
  return String(v);
}

function num(raw: Record<string, unknown>, ...keys: string[]): number | null {
  const v = pick(raw, ...keys);
  if (v === undefined || v === null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeMedia(raw: unknown): CommunityFloodReportMedia | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = str(r, 'id', 'Id');
  if (!id) return null;
  return {
    id,
    mediaType: pick(r, 'mediaType', 'MediaType') as string | null | undefined,
    mediaUrl: pick(r, 'mediaUrl', 'MediaUrl') as string | null | undefined,
    thumbnailUrl: pick(r, 'thumbnailUrl', 'ThumbnailUrl') as
      | string
      | null
      | undefined,
    createdAt: pick(r, 'createdAt', 'CreatedAt') as string | null | undefined
  };
}

export function normalizeCommunityFloodReport(
  raw: unknown
): CommunityFloodReport | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = str(r, 'id', 'Id');
  const lat = num(r, 'latitude', 'Latitude');
  const lng = num(r, 'longitude', 'Longitude');
  if (!id || lat == null || lng == null) return null;

  const reporterName =
    pick<string>(
      r,
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
      r,
      'reporterEmail',
      'ReporterEmail',
      'reporterUserEmail',
      'ReporterUserEmail',
      'email',
      'Email'
    ) ?? null;

  const reporterObj = pick<unknown>(
    r,
    'reporter',
    'Reporter',
    'reporterUser',
    'ReporterUser'
  );

  // Chốt lại bằng logic “ưu tiên name/email từ nested object nếu có”
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
      r,
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
    latitude: lat,
    longitude: lng,
    address: pick(r, 'address', 'Address') as string | null | undefined,
    description: pick(r, 'description', 'Description') as
      | string
      | null
      | undefined,
    severity: pick(r, 'severity', 'Severity') as string | null | undefined,
    trustScore: num(r, 'trustScore', 'TrustScore'),
    score: num(r, 'score', 'Score'),
    status: pick(r, 'status', 'Status') as string | null | undefined,
    confidenceLevel: pick(r, 'confidenceLevel', 'ConfidenceLevel') as
      | string
      | number
      | null
      | undefined,
    priority: pick(r, 'priority', 'Priority') as string | null | undefined,
    createdAt: pick(r, 'createdAt', 'CreatedAt') as string | null | undefined,
    updatedAt: pick(r, 'updatedAt', 'UpdatedAt') as string | null | undefined,
    media: Array.isArray(pick(r, 'media', 'Media'))
      ? ((pick(r, 'media', 'Media') as unknown[])
          .map(normalizeMedia)
          .filter(Boolean) as CommunityFloodReportMedia[])
      : []
  };
}

function extractList(json: unknown): unknown[] {
  if (!json || typeof json !== 'object') return [];
  const o = json as Record<string, unknown>;
  if (Array.isArray(o)) return o;
  if (Array.isArray(o.data)) return o.data as unknown[];
  if (Array.isArray(o.reports)) return o.reports as unknown[];
  if (Array.isArray(o.items)) return o.items as unknown[];
  if (o.data && typeof o.data === 'object') {
    const d = o.data as Record<string, unknown>;
    if (Array.isArray(d.items)) return d.items as unknown[];
  }
  return [];
}

/**
 * GET /api/v1/flood-reports/community
 */
export async function fetchCommunityFloodReports(
  accessTokenOrParams?: string | CommunityFloodReportsQuery,
  maybeParams?: CommunityFloodReportsQuery
): Promise<CommunityFloodReport[]>;
export async function fetchCommunityFloodReports(
  params?: CommunityFloodReportsQuery
): Promise<CommunityFloodReport[]>;
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

  const res = await fetch(url, { method: 'GET', headers, cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Community reports: ${res.status}`);
  }
  const json = await res.json().catch(() => null);
  const list = extractList(json);
  const out: CommunityFloodReport[] = [];
  for (const item of list) {
    const row = normalizeCommunityFloodReport(item);
    if (row) out.push(row);
  }
  return out;
}

export async function fetchCommunityFloodReportsPaged(
  params?: CommunityFloodReportsQuery
): Promise<CommunityFloodReportsResponse> {
  const res = await apiFetch<unknown>(buildCommunityReportsPath(params), {
    method: 'GET'
  });
  const list = extractList(res);
  const items = list
    .map(normalizeCommunityFloodReport)
    .filter(Boolean) as CommunityFloodReport[];

  const root =
    res && typeof res === 'object' ? (res as Record<string, unknown>) : {};
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

function buildCommunityReportsUrl(params?: CommunityFloodReportsQuery): string {
  const path = buildCommunityReportsPath(params);
  return `${API_BASE}${path}`;
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
  const qs = search.toString();
  return `/flood-reports/community${qs ? `?${qs}` : ''}`;
}
