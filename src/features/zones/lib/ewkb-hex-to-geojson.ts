import wkx from 'wkx';
import { Buffer } from 'buffer';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

/**
 * Parse PostGIS EWKB/WKB hex (e.g. "0106000020E6100000...") → GeoJSON geometry.
 */
export function ewkbHexToGeometry(hex: string): Geometry | null {
  try {
    const clean = hex.trim().replace(/^0x/i, '');
    if (clean.length < 16 || clean.length % 2 !== 0) return null;
    const buf = Buffer.from(clean, 'hex');
    const geom = wkx.Geometry.parse(buf);
    const gj = geom.toGeoJSON() as unknown;
    if (gj && typeof gj === 'object') {
      const o = gj as Record<string, unknown>;
      if (
        o.type === 'Feature' &&
        o.geometry &&
        typeof o.geometry === 'object'
      ) {
        return o.geometry as Geometry;
      }
      if (
        typeof o.type === 'string' &&
        [
          'Point',
          'LineString',
          'Polygon',
          'MultiPolygon',
          'MultiLineString',
          'MultiPoint'
        ].includes(o.type as string)
      ) {
        return gj as Geometry;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function administrativeAreasToFeatureCollection(
  items: Array<Record<string, unknown>>
): FeatureCollection {
  const features: Feature[] = [];
  for (const raw of items) {
    const id =
      pickStr(
        raw,
        'id',
        'Id',
        'wardId',
        'WardId',
        'areaId',
        'AreaId',
        'administrativeAreaId',
        'AdministrativeAreaId'
      ) ?? `area-${features.length}`;
    const name = pickStr(
      raw,
      'name',
      'Name',
      'wardName',
      'WardName',
      'title',
      'Title'
    );
    const code = pickStr(raw, 'code', 'Code', 'wardCode', 'WardCode');

    const geometry = resolveGeometry(raw);
    if (!geometry) continue;

    features.push({
      type: 'Feature',
      id,
      properties: {
        id,
        name: name ?? '',
        code: code ?? ''
      },
      geometry
    });
  }

  return { type: 'FeatureCollection', features };
}

/** GeoJSON object, EWKB hex, JSON string, hoặc mảng byte WKB. */
function resolveGeometry(raw: Record<string, unknown>): Geometry | null {
  const keys = [
    'geometry',
    'Geometry',
    'boundary',
    'Boundary',
    'geom',
    'Geom',
    'multiPolygonWkb',
    'MultiPolygonWkb',
    'geometryWkb',
    'GeometryWkb'
  ];

  for (const k of keys) {
    const v = raw[k];
    const g = geometryFromValue(v);
    if (g) return g;
  }
  return null;
}

function geometryFromValue(v: unknown): Geometry | null {
  if (!v) return null;

  if (
    typeof v === 'object' &&
    v !== null &&
    'type' in v &&
    'coordinates' in v
  ) {
    const t = (v as { type?: string }).type ?? '';
    if (t === 'Polygon' || t === 'MultiPolygon') return v as Geometry;
  }

  if (typeof v === 'string') {
    const s = v.trim();
    if (s.startsWith('{')) {
      try {
        const parsed = JSON.parse(s) as unknown;
        if (
          parsed &&
          typeof parsed === 'object' &&
          'type' in (parsed as object) &&
          'coordinates' in (parsed as object)
        ) {
          const t = (parsed as { type?: string }).type ?? '';
          if (t === 'Polygon' || t === 'MultiPolygon')
            return parsed as Geometry;
        }
      } catch {
        /* fall through */
      }
    }
    const clean = s.replace(/^0x/i, '');
    if (/^[0-9a-fA-F]+$/.test(clean) && clean.length >= 16) {
      return ewkbHexToGeometry(clean);
    }
  }

  if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'number') {
    try {
      const buf = Buffer.from(Uint8Array.from(v));
      const geom = wkx.Geometry.parse(buf);
      const gj = geom.toGeoJSON() as unknown;
      if (gj && typeof gj === 'object') {
        const o = gj as Record<string, unknown>;
        if (
          o.type === 'Feature' &&
          o.geometry &&
          typeof o.geometry === 'object'
        ) {
          return o.geometry as Geometry;
        }
        if (
          typeof o.type === 'string' &&
          ['Polygon', 'MultiPolygon'].includes(o.type as string)
        ) {
          return gj as Geometry;
        }
      }
    } catch {
      return null;
    }
  }

  return null;
}

function pickStr(
  obj: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return null;
}
