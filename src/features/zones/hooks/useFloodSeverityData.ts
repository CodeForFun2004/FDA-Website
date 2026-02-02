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

const isMapReady = (map: maplibregl.Map) => {
  if (typeof map.isStyleLoaded === 'function' && !map.isStyleLoaded())
    return false;
  if (typeof (map as any).loaded === 'function' && !(map as any).loaded())
    return false;
  return true;
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
    const zoom = Math.round(map.getZoom());

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

      setData(geojson);
      setStatus('success');
      onData?.(geojson);
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
