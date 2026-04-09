'use client';

import * as React from 'react';
import type maplibregl from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';

type Args = {
  mapRef: React.RefObject<maplibregl.Map | null>;
  enabled: boolean;
  opacity: number; // 0..1
  data?: any;
};

const EMPTY_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: []
};

export function useFloodSeverity({ mapRef, enabled, opacity, data }: Args) {
  const fillOpacity = Math.max(opacity, 0.95);

  const ensureLayer = React.useCallback(
    (map: maplibregl.Map) => {
      const sourceId = 'flood-severity';
      const markerLayerId = 'flood-severity-circle';
      const criticalLayerId = 'flood-severity-critical-radius';

      if (!map.isStyleLoaded()) return;

      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: EMPTY_GEOJSON
        });
      }

      if (!map.getLayer(markerLayerId)) {
        map.addLayer({
          id: markerLayerId,
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              8,
              15,
              12,
              24,
              16,
              36
            ],
            'circle-color': [
              'coalesce',
              ['get', 'markerColor'],
              [
                'match',
                ['get', 'severity'],
                'safe',
                '#16A34A',
                'caution',
                '#CA8A04',
                'warning',
                '#EA580C',
                'critical',
                '#DC2626',
                '#64748B'
              ]
            ],
            // Full-fill marker: bỏ viền trắng để không bị "chấm màu + vòng trắng"
            'circle-stroke-width': 0,
            'circle-opacity': fillOpacity
          }
        });
      } else {
        map.setPaintProperty(markerLayerId, 'circle-opacity', fillOpacity);
      }

      if (!map.getLayer(criticalLayerId)) {
        map.addLayer({
          id: criticalLayerId,
          type: 'circle',
          source: sourceId,
          filter: ['==', ['get', 'severity'], 'critical'],
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              8,
              ['coalesce', ['get', 'radiusPx'], 30],
              12,
              ['coalesce', ['get', 'radiusPx'], 70],
              16,
              ['coalesce', ['get', 'radiusPx'], 140]
            ],
            'circle-color': '#DC2626',
            'circle-opacity': 0.18,
            'circle-stroke-color': '#DC2626',
            'circle-stroke-opacity': 0.6,
            'circle-stroke-width': 2
          }
        });
      }
    },
    [fillOpacity]
  );

  const removeLayer = React.useCallback((map: maplibregl.Map) => {
    const sourceId = 'flood-severity';
    const markerLayerId = 'flood-severity-circle';
    const criticalLayerId = 'flood-severity-critical-radius';

    if (map.getLayer(criticalLayerId)) map.removeLayer(criticalLayerId);
    if (map.getLayer(markerLayerId)) map.removeLayer(markerLayerId);
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
      map.setPaintProperty(layerId, 'circle-opacity', fillOpacity);
    }
  }, [enabled, fillOpacity, mapRef]);
}
