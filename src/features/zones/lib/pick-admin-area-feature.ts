import type { Feature, Geometry } from 'geojson';

/**
 * Khi click, MapLibre có thể trả nhiều polygon chồng (ranh giới láng giềng).
 * Lấy `features[0]` là không ổn định → dễ gửi sai areaId (vd Hải Vân vs Ngũ Hành Sơn).
 * Heuristic: chọn polygon có bbox nhỏ nhất (thường là phường “đúng” dưới điểm click).
 */
export function pickBestAdminAreaFeature<T extends Feature>(features: T[]): T {
  if (features.length <= 1) return features[0];
  let best = features[0];
  let bestArea = geometryBBoxArea(best.geometry);
  for (let i = 1; i < features.length; i++) {
    const a = geometryBBoxArea(features[i].geometry);
    if (a < bestArea) {
      bestArea = a;
      best = features[i];
    }
  }
  return best;
}

function geometryBBoxArea(g: Geometry | null | undefined): number {
  if (!g) return Number.POSITIVE_INFINITY;
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const ring = (coords: number[][]) => {
    for (const p of coords) {
      const lng = Number(p?.[0]);
      const lat = Number(p?.[1]);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    }
  };

  if (g.type === 'Polygon') {
    for (const r of g.coordinates ?? []) ring(r);
  } else if (g.type === 'MultiPolygon') {
    for (const poly of g.coordinates ?? []) {
      for (const r of poly ?? []) ring(r);
    }
  } else {
    return Number.POSITIVE_INFINITY;
  }

  if (!Number.isFinite(minLng)) return Number.POSITIVE_INFINITY;
  return (maxLng - minLng) * (maxLat - minLat);
}
