'use client';

import * as React from 'react';
import type maplibregl from 'maplibre-gl';
import { getFloodSeverityGeoJSON } from '../api/floodSeverity';

type Args = {
  mapRef: React.RefObject<maplibregl.Map | null>;
  enabled: boolean;
  opacity: number; // 0..1
  onData?: (geojson: any) => void;
};

export function useFloodSeverity({ mapRef, enabled, opacity, onData }: Args) {
  const abortRef = React.useRef<AbortController | null>(null);
  const lastKeyRef = React.useRef<string>('');

  const ensureLayer = React.useCallback(
    (map: maplibregl.Map) => {
      const sourceId = 'flood-severity';
      const layerId = 'flood-severity-circle';

      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
      }

      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              8,
              4,
              12,
              7,
              16,
              10
            ],
            'circle-color': [
              'match',
              ['get', 'severityLevel'],
              0,
              '#22c55e', // safe
              1,
              '#eab308', // caution
              2,
              '#f97316', // warning
              3,
              '#ef4444', // critical
              '#94a3b8'
            ],
            'circle-stroke-color': '#0f172a',
            'circle-stroke-width': 1,
            'circle-opacity': opacity
          }
        });
      } else {
        map.setPaintProperty(layerId, 'circle-opacity', opacity);
      }
    },
    [opacity]
  );

  const removeLayer = React.useCallback((map: maplibregl.Map) => {
    const sourceId = 'flood-severity';
    const layerId = 'flood-severity-circle';

    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);
  }, []);

  const setData = React.useCallback((map: maplibregl.Map, geojson: any) => {
    const src = map.getSource('flood-severity') as any;
    if (src?.setData) src.setData(geojson);
  }, []);

  const fetchAndUpdate = React.useCallback(async () => {
    const map = mapRef.current;
    if (!map || !enabled) return;

    ensureLayer(map);

    const b = map.getBounds();
    const bounds = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
    const zoom = Math.round(map.getZoom());

    const key = `${bounds}|${zoom}`;
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const geojson = await getFloodSeverityGeoJSON({
        bounds,
        zoom,
        signal: ac.signal
      });
      if (ac.signal.aborted) return;

      onData?.(geojson);

      // update
      setData(map, geojson);
    } catch (e) {
      if ((e as any)?.name === 'AbortError') return;
      // bạn có thể toast lỗi ở đây nếu muốn
      // console.error("Flood severity fetch failed", e);
    }
  }, [enabled, ensureLayer, mapRef, onData, setData]);

  // bind events
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!enabled) {
      removeLayer(map);
      return;
    }

    // initial
    fetchAndUpdate();

    let t: any = null;
    const schedule = () => {
      clearTimeout(t);
      t = setTimeout(() => fetchAndUpdate(), 400);
    };

    map.on('moveend', schedule);
    map.on('zoomend', schedule);

    return () => {
      clearTimeout(t);
      map.off('moveend', schedule);
      map.off('zoomend', schedule);
    };
  }, [enabled, fetchAndUpdate, mapRef, removeLayer]);

  // update opacity
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !enabled) return;
    const layerId = 'flood-severity-circle';
    if (map.getLayer(layerId)) {
      map.setPaintProperty(layerId, 'circle-opacity', opacity);
    }
  }, [enabled, mapRef, opacity]);
}
