import * as React from 'react';
import type maplibregl from 'maplibre-gl';
import { getFloodSeverityGeoJSON } from '../api/flood-severity.api';

type Args = {
  mapRef: React.RefObject<maplibregl.Map | null>;
  enabled?: boolean;
  throttleMs?: number;
  onData?: (geojson: any) => void;
};

type Status = 'idle' | 'loading' | 'success' | 'error';

const DEFAULT_ZOOM = 12;
const METERS_PER_PIXEL_AT_ZOOM_0 = 156543.03392;
const DEG_TO_RAD = Math.PI / 180;

const isMapReady = (map: maplibregl.Map) => {
  if (typeof map.isStyleLoaded === 'function' && !map.isStyleLoaded())
    return false;
  if (typeof (map as any).loaded === 'function' && !(map as any).loaded())
    return false;
  return true;
};

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return null;
};

const resolveRadiusMeters = (properties: any) => {
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

const metersToPixels = (meters: number, latitude: number, zoom: number) => {
  const metersPerPixel =
    (METERS_PER_PIXEL_AT_ZOOM_0 * Math.cos(latitude * DEG_TO_RAD)) /
    Math.pow(2, zoom);
  if (!Number.isFinite(metersPerPixel) || metersPerPixel <= 0) return 0;
  return meters / metersPerPixel;
};

export function useFloodSeverityData({
  mapRef,
  enabled = true,
  throttleMs = 250,
  onData
}: Args) {
  const abortRef = React.useRef<AbortController | null>(null);
  const lastKeyRef = React.useRef<string>('');
  const [data, setData] = React.useState<any>(null);
  const [status, setStatus] = React.useState<Status>('idle');
  const [error, setError] = React.useState<string | null>(null);

  const fetchAndUpdate = React.useCallback(async () => {
    const map = mapRef.current;
    if (!map || !enabled || !isMapReady(map)) return;

    const b = map.getBounds();
    const bounds = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
    const zoom = Math.round(map.getZoom() ?? DEFAULT_ZOOM);

    const key = `${bounds}|${zoom}`;
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setStatus('loading');
    setError(null);

    try {
      const geojson = await getFloodSeverityGeoJSON({
        bounds,
        zoom,
        signal: ac.signal
      });
      if (ac.signal.aborted) return;

      const features = (geojson?.features ?? []).map((feature: any) => {
        const properties = feature?.properties ?? {};
        const coordinates = feature?.geometry?.coordinates;
        const latitude = Array.isArray(coordinates)
          ? toNumber(coordinates[1])
          : null;
        const radiusMeters = resolveRadiusMeters(properties);
        const radiusPx =
          latitude !== null && radiusMeters !== null && radiusMeters > 0
            ? metersToPixels(radiusMeters, latitude, zoom)
            : null;

        return {
          ...feature,
          properties: {
            ...properties,
            radiusMeters,
            radiusPx
          }
        };
      });

      const nextGeojson = {
        ...geojson,
        features
      };

      setData(nextGeojson);
      setStatus('success');
      onData?.(nextGeojson);
    } catch (e) {
      if ((e as any)?.name === 'AbortError') return;
      setStatus('error');
      setError((e as any)?.message ?? 'Failed to fetch flood severity');
    }
  }, [enabled, mapRef, onData]);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!enabled) {
      abortRef.current?.abort();
      return;
    }

    let t: any = null;
    const schedule = () => {
      clearTimeout(t);
      t = setTimeout(() => fetchAndUpdate(), throttleMs);
    };

    const handleLoad = () => {
      fetchAndUpdate();
    };

    if (isMapReady(map)) {
      fetchAndUpdate();
    } else {
      map.once('load', handleLoad);
    }

    map.on('moveend', schedule);
    map.on('zoomend', schedule);
    map.on('style.load', handleLoad);

    return () => {
      clearTimeout(t);
      map.off('moveend', schedule);
      map.off('zoomend', schedule);
      map.off('style.load', handleLoad);
      map.off('load', handleLoad);
    };
  }, [enabled, fetchAndUpdate, mapRef, throttleMs]);

  return { data, status, error, refresh: fetchAndUpdate };
}
