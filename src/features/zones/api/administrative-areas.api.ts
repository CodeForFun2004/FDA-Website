import { apiFetch } from '@/libs/api/client';

export type AdministrativeAreaLevel = 'ward' | 'district' | 'province' | string;

export type AdministrativeAreasQuery = {
  level: AdministrativeAreaLevel;
  pageNumber: number;
  pageSize: number;
};

/**
 * GET /admin/administrative-areas
 * e.g. ?level=ward&pageNumber=1&pageSize=10
 */
export async function getAdministrativeAreasPage(
  params: AdministrativeAreasQuery
): Promise<unknown> {
  const qs = new URLSearchParams({
    level: String(params.level),
    pageNumber: String(params.pageNumber),
    pageSize: String(params.pageSize)
  });
  return apiFetch<unknown>(`/admin/administrative-areas?${qs.toString()}`, {
    method: 'GET'
  });
}

function extractItems(raw: unknown): Record<string, unknown>[] {
  if (!raw || typeof raw !== 'object') return [];
  const r = raw as Record<string, unknown>;

  const tryArray = (v: unknown): Record<string, unknown>[] | null =>
    Array.isArray(v) ? (v as Record<string, unknown>[]) : null;

  const data = r.data ?? r.Data ?? r;
  const fromRoot = tryArray(data);
  if (fromRoot) return fromRoot;

  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    const nested =
      tryArray(d.items) ??
      tryArray(d.Items) ??
      tryArray(d.data) ??
      tryArray(d.Data) ??
      tryArray(d.results) ??
      tryArray(d.Results) ??
      tryArray(d.records) ??
      tryArray(d.Records) ??
      tryArray(d.value) ??
      tryArray(d.administrativeAreas) ??
      tryArray(d.AdministrativeAreas) ??
      tryArray(d.wards) ??
      tryArray(d.Wards);
    if (nested) return nested;
  }

  return tryArray(r.items) ?? tryArray(r.Items) ?? [];
}

function extractPageMeta(raw: unknown): {
  totalCount?: number;
  pageSize?: number;
  pageNumber?: number;
} {
  if (!raw || typeof raw !== 'object') return {};
  const r = raw as Record<string, unknown>;
  const data = (r.data ?? r.Data ?? r) as Record<string, unknown>;
  const src = data && typeof data === 'object' ? data : r;

  const totalCount = num(
    src.totalCount ?? src.TotalCount ?? src.total ?? src.Total
  );
  const pageSize = num(src.pageSize ?? src.PageSize ?? src.limit ?? src.Limit);
  const pageNumber = num(
    src.pageNumber ?? src.PageNumber ?? src.page ?? src.Page
  );

  return {
    totalCount: totalCount ?? undefined,
    pageSize: pageSize ?? undefined,
    pageNumber: pageNumber ?? undefined
  };
}

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Fetch all pages (ward level by default). Stops when page returns fewer than pageSize or maxPages.
 */
export async function fetchAllAdministrativeAreas(options?: {
  level?: AdministrativeAreaLevel;
  pageSize?: number;
  maxPages?: number;
}): Promise<Record<string, unknown>[]> {
  const level = options?.level ?? 'ward';
  const pageSize = options?.pageSize ?? 100;
  const maxPages = options?.maxPages ?? 200;

  const all: Record<string, unknown>[] = [];
  let pageNumber = 1;

  while (pageNumber <= maxPages) {
    const raw = await getAdministrativeAreasPage({
      level,
      pageNumber,
      pageSize
    });

    const items = extractItems(raw);
    all.push(...items);

    const meta = extractPageMeta(raw);
    if (items.length < pageSize) break;
    if (meta.totalCount != null && all.length >= meta.totalCount) break;
    if (items.length === 0) break;

    pageNumber += 1;
  }

  return all;
}
