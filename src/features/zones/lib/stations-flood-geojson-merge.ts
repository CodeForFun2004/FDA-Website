import type { Feature, FeatureCollection } from 'geojson';
import type { StationExtended } from '@/features/stations/types/station.type';
import type { FloodStationProperties } from '../api/flood-severity.api';
import { FLOOD_TIER_HEX } from './flood-severity-ui';

const DEFAULT_ZOOM = 12;
const METERS_PER_PIXEL_AT_ZOOM_0 = 156543.03392;
const DEG_TO_RAD = Math.PI / 180;

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return null;
};

export const resolveRadiusMeters = (properties: Record<string, unknown>) => {
  const direct =
    toNumber(properties?.radiusMeters) ??
    toNumber(properties?.radius) ??
    toNumber(properties?.alertRadius);
  if (direct !== null) return direct;

  const distance = toNumber(properties?.distance);
  if (distance === null) return null;

  const unit = String(properties?.unit ?? '').toLowerCase();
  if (unit === 'cm') return distance / 100;
  if (unit === 'm' || unit === 'meter' || unit === 'meters') return distance;
  return distance;
};

export const metersToPixels = (
  meters: number,
  latitude: number,
  zoom: number
) => {
  const metersPerPixel =
    (METERS_PER_PIXEL_AT_ZOOM_0 * Math.cos(latitude * DEG_TO_RAD)) /
    Math.pow(2, zoom);
  if (!Number.isFinite(metersPerPixel) || metersPerPixel <= 0) return 0;
  return meters / metersPerPixel;
};

/** Map API severity → paint match trong useFloodSeverity (layer dùng safe|caution|warning|critical) */
export function normalizeSeverityForLayer(
  sev: string | null | undefined
): string {
  const s = String(sev ?? 'unknown').toLowerCase();
  if (s === 'alarm') return 'caution';
  if (
    s === 'safe' ||
    s === 'caution' ||
    s === 'warning' ||
    s === 'critical' ||
    s === 'unknown'
  ) {
    return s;
  }
  return 'unknown';
}

function isValidCssColor(value: string | null | undefined): boolean {
  if (!value) return false;
  const c = value.trim();
  return (
    /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c) ||
    /^rgb(a?)\(/i.test(c) ||
    /^hsl(a?)\(/i.test(c)
  );
}

function isWhiteLikeColor(value: string): boolean {
  const c = value.trim().toLowerCase();
  return (
    c === '#fff' ||
    c === '#ffffff' ||
    c === 'rgb(255,255,255)' ||
    c === 'rgb(255, 255, 255)' ||
    c === 'rgba(255,255,255,1)' ||
    c === 'rgba(255, 255, 255, 1)' ||
    c === 'white'
  );
}

function severityColor(sev: string): string {
  if (sev === 'safe') return FLOOD_TIER_HEX.safe;
  if (sev === 'caution' || sev === 'alarm') return FLOOD_TIER_HEX.caution;
  if (sev === 'warning') return FLOOD_TIER_HEX.warning;
  if (sev === 'critical') return FLOOD_TIER_HEX.critical;
  return '#64748B';
}

function resolveSeverityFromLevel(args: {
  waterLevel: number | null | undefined;
  thresholdWarning: number | null | undefined;
  thresholdCritical: number | null | undefined;
  fallbackSeverity: string | null | undefined;
}) {
  const water = toNumber(args.waterLevel);
  const warn = toNumber(args.thresholdWarning);
  const crit = toNumber(args.thresholdCritical);

  if (water !== null) {
    if (crit !== null && water >= crit) return 'critical';
    if (warn !== null && water >= warn) return 'warning';
    if (warn !== null || crit !== null) return 'safe';
  }

  return normalizeSeverityForLayer(args.fallbackSeverity);
}

function resolveMarkerColor(args: {
  markerColor: string | null | undefined;
  alertLevel: string | null | undefined;
  severity: string;
}): string {
  if (isValidCssColor(args.markerColor)) {
    const raw = String(args.markerColor).trim();
    if (!isWhiteLikeColor(raw)) return raw;
  }

  const level = String(args.alertLevel ?? '').toLowerCase();
  if (
    level.includes('critical') ||
    level.includes('danger') ||
    level.includes('red')
  ) {
    return FLOOD_TIER_HEX.critical;
  }
  if (level.includes('warning') || level.includes('orange')) {
    return FLOOD_TIER_HEX.warning;
  }
  if (
    level.includes('alarm') ||
    level.includes('caution') ||
    level.includes('yellow')
  ) {
    return FLOOD_TIER_HEX.caution;
  }
  if (
    level.includes('safe') ||
    level.includes('normal') ||
    level.includes('green')
  ) {
    return FLOOD_TIER_HEX.safe;
  }

  return severityColor(args.severity);
}

export function stationToBaseFloodProperties(
  s: StationExtended
): FloodStationProperties {
  const severity = normalizeSeverityForLayer(
    s.status === 'online'
      ? 'safe'
      : s.status === 'maintenance'
        ? 'caution'
        : 'unknown'
  );
  return {
    id: s.id,
    stationId: s.id,
    stationCode: s.code,
    code: s.code,
    stationName: s.name,
    locationDesc: s.locationDesc ?? '',
    roadName: s.roadName ?? '',
    waterLevel: null,
    distance: null,
    sensorHeight: s.sensorHeight ?? null,
    unit: 'cm',
    measuredAt: s.lastSeenAt,
    severity: severity as FloodStationProperties['severity'],
    severityLevel: 0,
    stationStatus: s.status,
    lastSeenAt: s.lastSeenAt,
    markerColor: '',
    alertLevel: ''
  };
}

function enrichPropsWithRadius(
  properties: FloodStationProperties,
  lng: number,
  lat: number,
  zoom: number
): FloodStationProperties {
  const radiusMeters = resolveRadiusMeters(
    properties as unknown as Record<string, unknown>
  );
  const radiusPx =
    radiusMeters !== null && radiusMeters > 0
      ? metersToPixels(radiusMeters, lat, zoom)
      : null;
  return {
    ...properties,
    radiusMeters: radiusMeters ?? undefined,
    radiusPx: radiusPx ?? undefined
  } as FloodStationProperties;
}

function findMatchingFloodFeature(
  floodFeatures: Feature[],
  stationId: string,
  stationCode: string
): Feature | undefined {
  return floodFeatures.find((f) => {
    const p = (f.properties ?? {}) as Record<string, unknown>;
    const pid = String(p.stationId ?? p.id ?? '');
    const pcode = String(p.stationCode ?? p.code ?? '');
    return pid === stationId || pcode === stationCode;
  });
}

/**
 * GeoJSON cho map: điểm = tọa độ từ GET /stations/stations (giống tab Stations),
 * properties = telemetry từ /map/current-status khi khớp id/code.
 */
export function mergeStationsWithFloodGeojson(
  stations: StationExtended[],
  floodFc: FeatureCollection | null | undefined,
  zoom: number
): FeatureCollection {
  if (!stations.length) {
    return { type: 'FeatureCollection', features: [] };
  }

  const floodFeatures = floodFc?.features ?? [];
  const z = Number.isFinite(zoom) ? zoom : DEFAULT_ZOOM;

  const features = stations.map((s) => {
    const base = stationToBaseFloodProperties(s);
    const floodFeat = findMatchingFloodFeature(
      floodFeatures as GeoJSON.Feature[],
      s.id,
      s.code
    );
    const floodProps = (floodFeat?.properties ??
      {}) as Partial<FloodStationProperties>;
    const merged: FloodStationProperties = {
      ...base,
      ...floodProps,
      stationId: s.id,
      stationCode: s.code,
      stationName: floodProps.stationName ?? base.stationName,
      locationDesc: floodProps.locationDesc ?? base.locationDesc,
      roadName: floodProps.roadName ?? base.roadName,
      severity: normalizeSeverityForLayer(
        floodProps.severity ?? base.severity
      ) as FloodStationProperties['severity']
    };

    const derivedSeverity = resolveSeverityFromLevel({
      waterLevel: merged.waterLevel,
      thresholdWarning: s.thresholdWarning,
      thresholdCritical: s.thresholdCritical,
      fallbackSeverity: merged.severity
    });

    merged.severity = derivedSeverity as FloodStationProperties['severity'];
    merged.markerColor = resolveMarkerColor({
      markerColor: merged.markerColor,
      alertLevel: merged.alertLevel,
      severity: derivedSeverity
    });

    const lng = s.longitude;
    const lat = s.latitude;
    const props = enrichPropsWithRadius(merged, lng, lat, z);

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [lng, lat]
      },
      properties: props
    };
  });

  return { type: 'FeatureCollection', features };
}
