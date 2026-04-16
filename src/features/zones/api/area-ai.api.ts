import type { Feature, FeatureCollection } from 'geojson';

export class AiApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AiApiError';
    this.status = status;
  }
}

/** API đôi khi trả area_id dạng "\"uuid\"" — chuẩn hóa nội bộ (uuid thuần). */
export function normalizeAreaId(raw: unknown): string {
  if (raw == null) return '';
  let s = String(raw).trim();
  s = s.replace(/^["']+|["']+$/g, '');
  s = s.replace(/^\\"+|\\"+$/g, '');
  return s.trim();
}

function getAiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_AI_BASE_URL || '';
  return raw.replace(/\/+$/, '');
}

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
}

/** Path: `/area/{uuid}/verify/...` — uuid thuần, không encode dạng %22. */
export async function fetchSatelliteAnalysis(
  areaIdRaw: unknown
): Promise<unknown> {
  const id = normalizeAreaId(areaIdRaw);
  if (!id) throw new Error('Thiếu area id');

  const base = getAiBaseUrl();
  if (!base) throw new Error('Chưa cấu hình NEXT_PUBLIC_API_AI_BASE_URL');

  const qs = new URLSearchParams({
    use_bbox: 'true',
    use_fusion: 'true',
    capture_mode: 'square',
    include_permanent_water: 'false'
  });
  const url = `${base}/area/${id}/verify/satellite-analysis?${qs.toString()}`;

  const res = await fetch(url, { method: 'POST', cache: 'no-store' });

  const body = await parseJsonResponse(res);
  if (!res.ok) {
    throw new AiApiError(
      typeof (body as any)?.message === 'string'
        ? (body as any).message
        : `Satellite API ${res.status}`,
      res.status
    );
  }
  return body;
}

/** POST `/area/{uuid}/predict-flood-assemble` — dự báo/tổng hợp AI (ward status, trạm, forecast, Groq, …). */
export async function fetchPredictFloodAssemble(
  areaIdRaw: unknown
): Promise<unknown> {
  const id = normalizeAreaId(areaIdRaw);
  if (!id) throw new Error('Thiếu area id');

  const base = getAiBaseUrl();
  if (!base) throw new Error('Chưa cấu hình NEXT_PUBLIC_API_AI_BASE_URL');

  const url = `${base}/area/${id}/predict-flood-assemble`;
  const res = await fetch(url, { method: 'POST', cache: 'no-store' });

  const body = await parseJsonResponse(res);
  if (!res.ok) {
    throw new AiApiError(
      typeof (body as any)?.message === 'string'
        ? (body as any).message
        : `predict-flood-assemble ${res.status}`,
      res.status
    );
  }
  return body;
}

function isFeatureCollection(g: unknown): g is FeatureCollection {
  return (
    typeof g === 'object' &&
    g !== null &&
    (g as FeatureCollection).type === 'FeatureCollection' &&
    Array.isArray((g as FeatureCollection).features)
  );
}

function pushGeojsonFeatures(merged: Feature[], g: unknown) {
  if (isFeatureCollection(g)) {
    for (const f of g.features) {
      if (f) merged.push(f);
    }
    return;
  }
  if (
    typeof g === 'object' &&
    g !== null &&
    (g as Feature).type === 'Feature' &&
    (g as Feature).geometry
  ) {
    merged.push(g as Feature);
  }
}

async function fetchGeojsonUrl(url: string): Promise<Feature[]> {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) return [];
  const gj = await r.json();
  const out: Feature[] = [];
  pushGeojsonFeatures(out, gj);
  return out;
}

/**
 * Gom GeoJSON từ satellite-analysis: embedded geojson hoặc tải từ geojson_url (visuals / standardized_visuals).
 */
export async function extractSatelliteGeoJsonFromAnalysisResponse(
  json: unknown
): Promise<FeatureCollection | null> {
  const merged: Feature[] = [];

  const root = json as Record<string, unknown> | null;
  if (root?.geojson) {
    pushGeojsonFeatures(merged, root.geojson);
  }

  const individual = root?.individual_results;
  if (Array.isArray(individual)) {
    for (const item of individual) {
      const data = (item as any)?.result?.data;
      if (!data) continue;

      const status = (item as any)?.result?.status;
      if (status && status !== 'success') continue;

      if (data.geojson) {
        pushGeojsonFeatures(merged, data.geojson);
      }
    }

    if (merged.length === 0) {
      for (const item of individual) {
        const data = (item as any)?.result?.data;
        if (!data) continue;

        const visuals = data.visuals as { geojson_url?: string } | undefined;
        if (visuals?.geojson_url) {
          merged.push(...(await fetchGeojsonUrl(visuals.geojson_url)));
          if (merged.length) break;
        }

        const layers = data.standardized_visuals?.layers as
          | Record<string, { geojson_url?: string }>
          | undefined;
        if (layers) {
          const order = ['flood_anomaly', 'all_water'];
          for (const key of order) {
            const u = layers[key]?.geojson_url;
            if (u) {
              merged.push(...(await fetchGeojsonUrl(u)));
              if (merged.length) break;
            }
          }
        }
        if (merged.length) break;
      }
    }
  }

  if (merged.length === 0) return null;
  return { type: 'FeatureCollection', features: merged };
}

/**
 * Extract GeoJSON cho response predict-flood-assemble.
 * BE có thể nhét geometry theo nhiều shape:
 * - data.geoJson (FeatureCollection/Feature)
 * - data.geo_json (FeatureCollection/Feature)
 * - data.geojson_url (url)
 *
 * Nếu không tìm thấy -> null.
 */
export async function extractPredictGeoJsonFromPredictResponse(
  json: unknown
): Promise<FeatureCollection | null> {
  const root = json as Record<string, unknown> | null;
  const data = (root?.data ?? root) as Record<string, unknown> | null;
  const g: unknown = data
    ? ((data.geoJson as unknown) ??
      (data.geojson as unknown) ??
      (data.geo_json as unknown) ??
      (data.geojson_url as unknown) ??
      (data.visuals as any)?.geojson_url)
    : undefined;

  if (!g) return null;

  // Url geojson
  if (typeof g === 'string') {
    const features = await fetchGeojsonUrl(g);
    if (features.length === 0) return null;
    return { type: 'FeatureCollection', features };
  }

  // Direct FC
  if (isFeatureCollection(g)) return g;

  // Single Feature
  if (typeof g === 'object' && g != null && (g as Feature).type === 'Feature') {
    const f = g as Feature;
    if (!f.geometry) return null;
    return { type: 'FeatureCollection', features: [f] };
  }

  // Some APIs return { features: [...] } without explicit FeatureCollection.type
  if (
    typeof g === 'object' &&
    g != null &&
    Array.isArray((g as any).features)
  ) {
    const features = (g as any).features as Feature[];
    if (features.length === 0) return null;
    return { type: 'FeatureCollection', features };
  }

  return null;
}
