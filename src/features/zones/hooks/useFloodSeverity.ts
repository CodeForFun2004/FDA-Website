'use client';

import * as React from 'react';
import type maplibregl from 'maplibre-gl';

type Args = {
  mapRef: React.RefObject<maplibregl.Map | null>;
  enabled: boolean;
  opacity: number; // 0..1
  data?: any;
};

const EMPTY_GEOJSON = { type: 'FeatureCollection', features: [] };

export function useFloodSeverity({ mapRef, enabled, opacity, data }: Args) {
  const ensureLayer = React.useCallback(
    (map: maplibregl.Map) => {
      const sourceId = 'flood-severity';
      const layerId = 'flood-severity-circle';

      if (!map.isStyleLoaded()) return;

      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: EMPTY_GEOJSON
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

  const syncLayer = React.useCallback(() => {
    const map = mapRef.current;
    if (!map || !enabled || !map.isStyleLoaded()) return;
    ensureLayer(map);
    setData(map, data ?? EMPTY_GEOJSON);
  }, [data, enabled, ensureLayer, mapRef, setData]);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!enabled) {
      removeLayer(map);
      return;
    }

    const handleLoad = () => {
      syncLayer();
    };

    if (map.isStyleLoaded()) {
      syncLayer();
    } else {
      map.once('load', handleLoad);
    }

    map.on('style.load', handleLoad);

    return () => {
      map.off('style.load', handleLoad);
      map.off('load', handleLoad);
    };
  }, [enabled, mapRef, removeLayer, syncLayer]);

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
