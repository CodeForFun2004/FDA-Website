'use client';

import * as React from 'react';
import type maplibregl from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import { getFloodSeverityGeoJSON } from '../api/flood-severity.api';
import type { FloodGeoJsonFeature } from '../api/flood-severity.api';
import {
  metersToPixels,
  resolveRadiusMeters
} from '../lib/stations-flood-geojson-merge';

type Args = {
  mapRef: React.RefObject<maplibregl.Map | null>;
  enabled?: boolean;
  throttleMs?: number;
  onData?: (geojson: FeatureCollection) => void;
};

type Status = 'idle' | 'loading' | 'success' | 'error';

const DEFAULT_ZOOM = 12;

const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] };

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return null;
};

const isMapReady = (map: maplibregl.Map) => {
  if (typeof map.isStyleLoaded === 'function' && !map.isStyleLoaded())
    return false;
  if (typeof (map as any).loaded === 'function' && !(map as any).loaded())
    return false;
  return true;
};

function enrichFloodGeojsonWithRadius(geojson: any, zoom: number) {
  const features = (geojson?.features ?? []).map((feature: any) => {
    // Only Point features have a simple [lng,lat] coordinate tuple.
    if (feature?.geometry?.type !== 'Point') return feature;

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

  return {
    ...geojson,
    features
  } as FeatureCollection;
}

/**
 * Layer trạm trên map: danh sách từ GET /stations/stations (cùng nguồn với tab Stations),
 * màu/mực nước từ /map/current-status khi khớp id/code.
 */
export function useStationsMapLayerData({
  mapRef,
  enabled = true,
  throttleMs = 250,
  onData
}: Args) {
  const abortRef = React.useRef<AbortController | null>(null);
  const lastKeyRef = React.useRef<string>('');
  const zoomRef = React.useRef(DEFAULT_ZOOM);
  const [floodGeojson, setFloodGeojson] =
    React.useState<FeatureCollection | null>(null);
  const [status, setStatus] = React.useState<Status>('idle');
  const [error, setError] = React.useState<string | null>(null);

  const merged = React.useMemo(() => {
    if (!enabled) return EMPTY;
    if (!floodGeojson) return EMPTY;

    return floodGeojson;
  }, [enabled, floodGeojson]);

  React.useEffect(() => {
    onData?.(merged);
  }, [merged, onData]);

  const fetchFloodForViewport = React.useCallback(async () => {
    const map = mapRef.current;
    if (!map || !enabled || !isMapReady(map)) return;

    const b = map.getBounds();
    const bounds = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
    const zoom = Math.round(map.getZoom() ?? DEFAULT_ZOOM);
    zoomRef.current = zoom;

    const key = `${bounds}|${zoom}`;
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setStatus('loading');
    setError(null);

    try {
      const raw = await getFloodSeverityGeoJSON({
        bounds,
        zoom,
        signal: ac.signal
      });
      if (ac.signal.aborted) return;

      const enriched = enrichFloodGeojsonWithRadius(raw, zoom);
      setFloodGeojson(enriched);
      setStatus('success');
    } catch (e) {
      if ((e as any)?.name === 'AbortError') return;
      setStatus('error');
      setError((e as any)?.message ?? 'Failed to fetch flood severity');
      setFloodGeojson(null);
    }
  }, [enabled, mapRef]);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!enabled) {
      abortRef.current?.abort();
      lastKeyRef.current = '';
      setFloodGeojson(null);
      setStatus('idle');
      return;
    }

    let t: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => void fetchFloodForViewport(), throttleMs);
    };

    const handleLoad = () => {
      void fetchFloodForViewport();
    };

    if (isMapReady(map)) {
      void fetchFloodForViewport();
    } else {
      map.once('load', handleLoad);
    }

    map.on('moveend', schedule);
    map.on('zoomend', schedule);
    map.on('style.load', handleLoad);

    return () => {
      if (t) clearTimeout(t);
      map.off('moveend', schedule);
      map.off('zoomend', schedule);
      map.off('style.load', handleLoad);
      map.off('load', handleLoad);
    };
  }, [enabled, fetchFloodForViewport, mapRef, throttleMs]);

  return {
    data: merged,
    status,
    error,
    refresh: fetchFloodForViewport
  };
}
