const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL_TVT ?? 'https://fda.id.vn/api';

export type FloodStationProperties = {
  stationId: string;
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

export type FloodSeverityResponse = {
  success: boolean;
  message: string;
  data: {
    type: 'FeatureCollection';
    features: {
      type: 'Feature';
      geometry: {
        type: 'Point';
        coordinates: [number, number];
      };
      properties: FloodStationProperties;
    }[];
    metadata: {
      totalStations: number;
      stationsWithData: number;
      stationsNoData: number;
      generatedAt: string;
      bounds: any;
    };
  };
};

export async function getFloodSeverityGeoJSON(args: {
  bounds: string;
  zoom: number;
  signal?: AbortSignal;
}) {
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
  return json.data; // Return the FeatureCollection directly
}
