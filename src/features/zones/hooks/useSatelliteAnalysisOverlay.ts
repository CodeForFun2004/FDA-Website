'use client';

import * as React from 'react';
import type maplibregl from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';

type Args = {
  mapRef: React.RefObject<maplibregl.Map | null>;
  enabled: boolean;
  data: FeatureCollection | null;
  fitBounds?: boolean;
};

const SOURCE_ID = 'satellite-analysis-overlay';
const FILL_ID = 'satellite-analysis-fill';
const LINE_ID = 'satellite-analysis-line';

const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] };

export function useSatelliteAnalysisOverlay({
  mapRef,
  enabled,
  data,
  fitBounds = true
}: Args) {
  const fittedRef = React.useRef(false);
  const dataKeyRef = React.useRef<string>('');

  const sync = React.useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const active = enabled && data && data.features && data.features.length > 0;

    if (!active) {
      if (map.getLayer(LINE_ID)) map.removeLayer(LINE_ID);
      if (map.getLayer(FILL_ID)) map.removeLayer(FILL_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      fittedRef.current = false;
      return;
    }

    const fc = data!;

    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, { type: 'geojson', data: EMPTY });
    }

    if (!map.getLayer(FILL_ID)) {
      map.addLayer({
        id: FILL_ID,
        type: 'fill',
        source: SOURCE_ID,
        paint: {
          'fill-color': '#f97316',
          'fill-opacity': 0.35
        }
      });
    }

    if (!map.getLayer(LINE_ID)) {
      map.addLayer({
        id: LINE_ID,
        type: 'line',
        source: SOURCE_ID,
        paint: {
          'line-color': '#c2410c',
          'line-width': 1.5,
          'line-opacity': 0.95
        }
      });
    }

    const src = map.getSource(SOURCE_ID) as
      | maplibregl.GeoJSONSource
      | undefined;
    if (src?.setData) {
      src.setData(fc);
    }

    const key = `${fc.features.length}:${(fc.features[0] as any)?.id ?? ''}`;
    if (fitBounds && (!fittedRef.current || dataKeyRef.current !== key)) {
      const b = boundsFromFc(fc);
      if (b) {
        map.fitBounds(
          [
            [b[0], b[1]],
            [b[2], b[3]]
          ],
          { padding: 56, duration: 800, maxZoom: 15 }
        );
        fittedRef.current = true;
        dataKeyRef.current = key;
      }
    }
  }, [data, enabled, fitBounds, mapRef]);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const run = () => sync();

    if (map.isStyleLoaded()) {
      run();
    } else {
      map.once('load', run);
    }

    map.on('style.load', run);

    return () => {
      map.off('style.load', run);
    };
  }, [mapRef, sync]);
}

function boundsFromFc(
  fc: FeatureCollection
): [number, number, number, number] | null {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const ring = (coords: number[][]) => {
    for (const pt of coords) {
      const lng = pt[0];
      const lat = pt[1];
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
  };

  for (const f of fc.features) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === 'Polygon') {
      g.coordinates.forEach(ring);
    } else if (g.type === 'MultiPolygon') {
      g.coordinates.forEach((poly) => poly.forEach(ring));
    }
  }

  if (!Number.isFinite(minLng)) return null;
  return [minLng, minLat, maxLng, maxLat];
}
