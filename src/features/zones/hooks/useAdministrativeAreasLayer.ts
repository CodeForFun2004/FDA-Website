'use client';

import * as React from 'react';
import type maplibregl from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';

type Args = {
  mapRef: React.RefObject<maplibregl.Map | null>;
  enabled: boolean;
  data: FeatureCollection;
  fitBounds?: boolean;
};

const SOURCE_ID = 'administrative-areas';
const FILL_ID = 'administrative-areas-fill';
const LINE_ID = 'administrative-areas-outline';
const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] };

export function useAdministrativeAreasLayer({
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

    if (!enabled) {
      if (map.getLayer(LINE_ID)) map.removeLayer(LINE_ID);
      if (map.getLayer(FILL_ID)) map.removeLayer(FILL_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      fittedRef.current = false;
      return;
    }

    /** Thêm lên cùng stack (sau community + stations — map-view gọi moveLayer cố định thứ tự). */
    const beforeId = undefined;

    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: EMPTY
      });
    }

    if (!map.getLayer(FILL_ID)) {
      map.addLayer(
        {
          id: FILL_ID,
          type: 'fill',
          source: SOURCE_ID,
          paint: {
            'fill-color': '#2563eb',
            'fill-opacity': 0.18
          }
        },
        beforeId
      );
    }

    if (!map.getLayer(LINE_ID)) {
      map.addLayer(
        {
          id: LINE_ID,
          type: 'line',
          source: SOURCE_ID,
          paint: {
            'line-color': '#1e40af',
            'line-width': 2,
            'line-opacity': 0.95
          }
        },
        beforeId
      );
    }

    const src = map.getSource(SOURCE_ID) as
      | maplibregl.GeoJSONSource
      | undefined;
    if (src?.setData) {
      src.setData(data);
    }

    const key = `${data.features.length}:${data.features[0]?.id ?? ''}`;
    if (
      fitBounds &&
      data.features.length > 0 &&
      (!fittedRef.current || dataKeyRef.current !== key)
    ) {
      const b = boundsFromFc(data);
      if (b) {
        map.fitBounds(
          [
            [b[0], b[1]],
            [b[2], b[3]]
          ],
          { padding: 48, duration: 800, maxZoom: 14 }
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
