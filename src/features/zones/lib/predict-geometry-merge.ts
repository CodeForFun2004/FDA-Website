import type {
  Feature,
  FeatureCollection,
  Geometry,
  MultiPolygon,
  Polygon
} from 'geojson';

type Position = [number, number];
type Bounds = {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
};

function isFinitePosition(p: unknown): p is Position {
  return (
    Array.isArray(p) &&
    p.length >= 2 &&
    Number.isFinite(p[0]) &&
    Number.isFinite(p[1])
  );
}

function sanitizeRing(input: unknown): Position[] | null {
  if (!Array.isArray(input)) return null;
  const ring = input
    .filter(isFinitePosition)
    .map((p) => [p[0], p[1]] as Position);
  if (ring.length < 4) return null;
  return ring;
}

function sanitizePolygon(input: unknown): Position[][] | null {
  if (!Array.isArray(input)) return null;
  const rings: Position[][] = [];
  for (const ring of input) {
    const cleanRing = sanitizeRing(ring);
    if (cleanRing) rings.push(cleanRing);
  }
  if (!rings.length) return null;
  return rings;
}

function toPolygonList(geometry: Geometry): Position[][][] | null {
  if (geometry.type === 'Polygon') {
    const polygon = sanitizePolygon(geometry.coordinates);
    return polygon ? [polygon] : null;
  }
  if (geometry.type === 'MultiPolygon') {
    const polygons: Position[][][] = [];
    for (const poly of geometry.coordinates) {
      const sanitized = sanitizePolygon(poly);
      if (sanitized) polygons.push(sanitized);
    }
    return polygons.length ? polygons : null;
  }
  return null;
}

function isPolygonGeometry(
  geometry: Geometry | null | undefined
): geometry is Polygon | MultiPolygon {
  return Boolean(
    geometry &&
      (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon')
  );
}

function getBoundsFromPolygons(polygons: Position[][][]): Bounds | null {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const poly of polygons) {
    for (const ring of poly) {
      for (const [lng, lat] of ring) {
        if (lng < minLng) minLng = lng;
        if (lat < minLat) minLat = lat;
        if (lng > maxLng) maxLng = lng;
        if (lat > maxLat) maxLat = lat;
      }
    }
  }
  if (!Number.isFinite(minLng)) return null;
  return { minLng, minLat, maxLng, maxLat };
}

function pointInBounds(point: Position, bounds: Bounds): boolean {
  const [lng, lat] = point;
  return (
    lng >= bounds.minLng &&
    lng <= bounds.maxLng &&
    lat >= bounds.minLat &&
    lat <= bounds.maxLat
  );
}

function isPointInRing(point: Position, ring: Position[]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-12) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function isPointInPolygon(point: Position, polygon: Position[][]): boolean {
  const [outerRing, ...holes] = polygon;
  if (!outerRing || !isPointInRing(point, outerRing)) return false;
  for (const hole of holes) {
    if (isPointInRing(point, hole)) return false;
  }
  return true;
}

function isPointInMultiPolygon(
  point: Position,
  polygons: Position[][][]
): boolean {
  for (const polygon of polygons) {
    if (isPointInPolygon(point, polygon)) return true;
  }
  return false;
}

function featureVerticesInsideAdmin(
  feature: Feature,
  adminPolygons: Position[][][],
  adminBounds: Bounds
): boolean {
  if (!isPolygonGeometry(feature.geometry)) return false;
  const polygons = toPolygonList(feature.geometry);
  if (!polygons) return false;
  for (const polygon of polygons) {
    const outerRing = polygon[0];
    if (!outerRing) continue;
    for (const point of outerRing) {
      if (!pointInBounds(point, adminBounds)) return false;
      if (!isPointInMultiPolygon(point, adminPolygons)) return false;
    }
  }
  return true;
}

export function buildClippedPredictFeatureCollection(args: {
  extracted: FeatureCollection | null;
  adminGeometry: Geometry | null | undefined;
  predictTier: string;
}): FeatureCollection | null {
  if (!args.extracted || args.extracted.features.length === 0) return null;
  if (!isPolygonGeometry(args.adminGeometry)) return null;

  const adminPolygons = toPolygonList(args.adminGeometry);
  if (!adminPolygons) return null;
  const adminBounds = getBoundsFromPolygons(adminPolygons);
  if (!adminBounds) return null;

  const features: Feature[] = [];
  for (const feature of args.extracted.features) {
    if (!feature) continue;
    if (!featureVerticesInsideAdmin(feature, adminPolygons, adminBounds))
      continue;
    features.push({
      ...feature,
      properties: {
        ...(feature.properties ?? {}),
        predictTier: args.predictTier
      }
    });
  }

  if (features.length === 0) return null;
  return {
    type: 'FeatureCollection',
    features
  };
}
