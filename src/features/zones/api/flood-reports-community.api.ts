const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://fda.id.vn/api/v1';

export type CommunityFloodReport = {
  id: string;
  reporterUserId?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  description?: string | null;
  severity?: string | null;
  trustScore?: number | null;
  status?: string | null;
  confidenceLevel?: number | null;
  priority?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
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

export function normalizeCommunityFloodReport(
  raw: unknown
): CommunityFloodReport | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = str(r, 'id', 'Id');
  const lat = num(r, 'latitude', 'Latitude');
  const lng = num(r, 'longitude', 'Longitude');
  if (!id || lat == null || lng == null) return null;

  return {
    id,
    reporterUserId: pick(r, 'reporterUserId', 'ReporterUserId') as
      | string
      | null
      | undefined,
    latitude: lat,
    longitude: lng,
    address: pick(r, 'address', 'Address') as string | null | undefined,
    description: pick(r, 'description', 'Description') as
      | string
      | null
      | undefined,
    severity: pick(r, 'severity', 'Severity') as string | null | undefined,
    trustScore: num(r, 'trustScore', 'TrustScore'),
    status: pick(r, 'status', 'Status') as string | null | undefined,
    confidenceLevel: num(r, 'confidenceLevel', 'ConfidenceLevel'),
    priority: pick(r, 'priority', 'Priority') as string | null | undefined,
    createdAt: pick(r, 'createdAt', 'CreatedAt') as string | null | undefined,
    updatedAt: pick(r, 'updatedAt', 'UpdatedAt') as string | null | undefined
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
  accessToken?: string
): Promise<CommunityFloodReport[]> {
  const url = `${API_BASE}/flood-reports/community`;
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
