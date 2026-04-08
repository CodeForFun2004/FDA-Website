'use client';

import * as React from 'react';
import type maplibregl from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';

const SOURCE_ID = 'community-flood-reports';
/** Layer cờ — thứ tự z: trên stations, dưới admin (map-view xử lý moveLayer). */
export const COMMUNITY_REPORTS_LAYER_ID = 'community-reports-symbol';

const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] };

type Args = {
  mapRef: React.RefObject<maplibregl.Map | null>;
  enabled: boolean;
  data: FeatureCollection;
};

export function useCommunityReportsLayer({ mapRef, enabled, data }: Args) {
  const sync = React.useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (!enabled) {
      if (map.getLayer(COMMUNITY_REPORTS_LAYER_ID)) {
        map.removeLayer(COMMUNITY_REPORTS_LAYER_ID);
      }
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      return;
    }

    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: EMPTY
      });
    }

    if (!map.getLayer(COMMUNITY_REPORTS_LAYER_ID)) {
      map.addLayer({
        id: COMMUNITY_REPORTS_LAYER_ID,
        type: 'symbol',
        source: SOURCE_ID,
        layout: {
          'text-field': '🚩',
          'text-size': 26,
          'text-allow-overlap': true,
          'text-ignore-placement': true,
          'text-anchor': 'bottom',
          'text-offset': [0, -0.4]
        },
        paint: {
          'text-color': ['coalesce', ['get', 'markerColor'], '#CA8A04'],
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.2
        }
      });
    }

    const src = map.getSource(SOURCE_ID) as
      | maplibregl.GeoJSONSource
      | undefined;
    if (src?.setData) src.setData(data);
  }, [data, enabled, mapRef]);

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
