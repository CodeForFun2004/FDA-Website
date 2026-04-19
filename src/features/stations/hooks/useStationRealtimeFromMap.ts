import * as React from 'react';
import type { Station } from '@/features/stations/types/station.type';
import {
  getFloodSeverityGeoJSON,
  type FloodStationProperties
} from '@/features/zones/api/flood-severity.api';

export type StationRealtimeFromMap = {
  properties: FloodStationProperties | null;
  isLoading: boolean;
  error: string | null;
  refreshedAt: string | null;
  refresh: () => void;
};

function toBoundsAroundStation(args: {
  latitude: number;
  longitude: number;
  radiusKm?: number;
}): string {
  const { latitude, longitude, radiusKm = 2 } = args;

  // 1 deg lat ~ 111km
  const deltaLat = radiusKm / 111;
  const latRad = (latitude * Math.PI) / 180;
  const cosLat = Math.max(0.1, Math.cos(latRad)); // avoid blow-up near poles
  const deltaLng = radiusKm / (111 * cosLat);

  const south = latitude - deltaLat;
  const north = latitude + deltaLat;
  const west = longitude - deltaLng;
  const east = longitude + deltaLng;

  // API expects: south,west,north,east
  return `${south},${west},${north},${east}`;
}

function matchStation(
  props: FloodStationProperties | null | undefined,
  station: Station
) {
  const stationId = station.id?.trim();
  const stationCode = station.code?.trim();

  const pId = String(props?.stationId ?? '').trim();
  const pCode = String(props?.stationCode ?? '').trim();

  if (stationId && pId && pId === stationId) return true;
  if (stationCode && pCode && pCode === stationCode) return true;
  return false;
}

export function useStationRealtimeFromMap(args: {
  station: Station | null;
  zoom?: number;
  radiusKm?: number;
  enabled?: boolean;
  pollMs?: number;
}): StationRealtimeFromMap {
  const {
    station,
    enabled = true,
    zoom = 14,
    radiusKm = 2,
    pollMs = 15000
  } = args;

  const [properties, setProperties] =
    React.useState<FloodStationProperties | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = React.useState<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  const doFetch = React.useCallback(async () => {
    if (!enabled || !station) return;
    if (
      !Number.isFinite(station.latitude) ||
      !Number.isFinite(station.longitude)
    )
      return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setIsLoading(true);
    setError(null);
    try {
      const bounds = toBoundsAroundStation({
        latitude: station.latitude,
        longitude: station.longitude,
        radiusKm
      });

      const fc = await getFloodSeverityGeoJSON({
        bounds,
        zoom,
        signal: ac.signal
      });

      if (ac.signal.aborted) return;

      const features = (fc?.features ?? []) as any[];
      const hit = features
        .map((f) => f?.properties as FloodStationProperties)
        .find((p) => matchStation(p, station));

      setProperties(hit ?? null);
      setRefreshedAt(new Date().toISOString());
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      setError(e?.message ?? 'Không thể lấy dữ liệu realtime');
      setProperties(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, radiusKm, station, zoom]);

  React.useEffect(() => {
    if (!enabled || !station) return;
    void doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, station?.id]);

  React.useEffect(() => {
    if (!enabled || !station) return;
    const t = setInterval(() => {
      void doFetch();
    }, pollMs);
    return () => clearInterval(t);
  }, [doFetch, enabled, pollMs, station]);

  React.useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    properties,
    isLoading,
    error,
    refreshedAt,
    refresh: () => void doFetch()
  };
}
