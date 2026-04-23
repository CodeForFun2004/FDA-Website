import { getPublicApiBaseUrl } from '@/libs/env';

const API_BASE = getPublicApiBaseUrl();

export type FloodStationProperties = {
  id?: string | null;
  code?: string | null;
  stationId?: string | null;
  /** Khớp trạm với khu admin (street) — BE có thể camelCase hoặc PascalCase */
  administrativeAreaId?: string | null;
  AdministrativeAreaId?: string | null;
  stationCode: string;
  stationName: string;
  locationDesc: string;
  roadName: string;
  waterLevel: number | null;
  distance: number | null;
  sensorHeight: number | null;
  unit: string;
  measuredAt: string | null;
  severity: 'safe' | 'alarm' | 'warning' | 'critical' | 'unknown'; // Adjust based on actual values if needed, saw 'safe', 'unknown'
  severityLevel: number;
  stationStatus: string;
  lastSeenAt: string | null;
  markerColor: string;
  alertLevel: string;
};

// Backend `/map/current-status` có thể trả cả Point (station) và Polygon (coverage)
export type FloodZoneProperties = {
  featureType?: 'floodZone' | string;
  stationId?: string | null;
  stationCode?: string | null;
  stationName?: string | null;
  severity?: 'warning' | 'critical' | string;
  severityLevel?: number | null;
  waterLevel?: number | null;
  fillColor?: string | null;
  fillOpacity?: number | null;
};

export type FloodFeatureProperties = FloodStationProperties &
  FloodZoneProperties & {
    [key: string]: unknown;
  };

export type FloodGeoJsonFeature = {
  type: 'Feature';
  geometry:
    | { type: 'Point'; coordinates: [number, number] }
    | { type: 'Polygon'; coordinates: [number, number][][] }
    | { type: 'MultiPolygon'; coordinates: [number, number][][][] };
  properties: FloodFeatureProperties;
};

export type FloodGeoJson = {
  type: 'FeatureCollection';
  features: FloodGeoJsonFeature[];
  metadata?: {
    totalStations?: number;
    stationsWithData?: number;
    stationsNoData?: number;
    generatedAt?: string;
    bounds?: unknown;
    [key: string]: unknown;
  };
};

export type FloodSeverityResponse = {
  success: boolean;
  message: string;
  data: {
    type: 'FeatureCollection';
    features: FloodGeoJsonFeature[];
    metadata?: FloodGeoJson['metadata'];
  };
};

export async function getFloodSeverityGeoJSON(args: {
  bounds: string;
  zoom: number;
  signal?: AbortSignal;
}): Promise<FloodGeoJson> {
  const { bounds, zoom, signal } = args;
  const url = new URL(`${API_BASE}/map/current-status`);
  url.searchParams.set('bounds', bounds);
  url.searchParams.set('zoom', String(zoom));

  const res = await fetch(url.toString(), {
    method: 'GET',
    signal,
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Flood severity API error');
  const json = (await res.json()) as FloodSeverityResponse;
  const geojson = json.data;

  // Normalize properties so stationId/stationCode are always available
  const features = (geojson?.features ?? []).map((feature) => {
    const properties = feature?.properties ?? ({} as FloodFeatureProperties);
    return {
      ...feature,
      properties: {
        ...properties,
        stationId: properties.stationId ?? properties.id ?? null,
        stationCode: properties.stationCode ?? properties.code ?? null,
        administrativeAreaId:
          properties.administrativeAreaId ??
          properties.AdministrativeAreaId ??
          null
      }
    };
  });

  return {
    ...geojson,
    features
  };
}
