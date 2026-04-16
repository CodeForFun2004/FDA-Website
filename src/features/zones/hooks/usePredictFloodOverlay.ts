'use client';

import * as React from 'react';
import type maplibregl from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import {
  FLOOD_TIER_HEX,
  type FloodSeverityTier
} from '@/features/zones/lib/flood-severity-ui';

type Args = {
  mapRef: React.RefObject<maplibregl.Map | null>;
  enabled: boolean;
  data: FeatureCollection | null;
  opacity: number; // 0..1
};

const SOURCE_ID = 'predict-flood-overlay';
export const PREDICT_FILL_LAYER_ID = 'predict-flood-analysis-fill';
export const PREDICT_LINE_LAYER_ID = 'predict-flood-analysis-line';

const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] };

export function usePredictFloodOverlay({
  mapRef,
  enabled,
  data,
  opacity
}: Args) {
  const sync = React.useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const active =
      enabled &&
      data &&
      Array.isArray(data.features) &&
      data.features.length > 0;

    if (!active) {
      if (map.getLayer(PREDICT_LINE_LAYER_ID))
        map.removeLayer(PREDICT_LINE_LAYER_ID);
      if (map.getLayer(PREDICT_FILL_LAYER_ID))
        map.removeLayer(PREDICT_FILL_LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      return;
    }

    const fc = data!;

    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, { type: 'geojson', data: EMPTY });
    }

    const beforeId = map.getLayer('administrative-areas-outline')
      ? 'administrative-areas-outline'
      : undefined;

    if (!map.getLayer(PREDICT_FILL_LAYER_ID)) {
      map.addLayer(
        {
          id: PREDICT_FILL_LAYER_ID,
          type: 'fill',
          source: SOURCE_ID,
          paint: {
            'fill-color': [
              'match',
              ['coalesce', ['get', 'predictTier'], 'caution'],
              'safe',
              FLOOD_TIER_HEX.safe,
              'caution',
              FLOOD_TIER_HEX.caution,
              'warning',
              FLOOD_TIER_HEX.warning,
              'critical',
              FLOOD_TIER_HEX.critical,
              FLOOD_TIER_HEX.caution
            ],
            'fill-opacity': opacity
          }
        },
        beforeId
      );
    }

    if (!map.getLayer(PREDICT_LINE_LAYER_ID)) {
      map.addLayer(
        {
          id: PREDICT_LINE_LAYER_ID,
          type: 'line',
          source: SOURCE_ID,
          paint: {
            'line-color': [
              'match',
              ['coalesce', ['get', 'predictTier'], 'caution'],
              'safe',
              FLOOD_TIER_HEX.safe,
              'caution',
              FLOOD_TIER_HEX.caution,
              'warning',
              FLOOD_TIER_HEX.warning,
              'critical',
              FLOOD_TIER_HEX.critical,
              FLOOD_TIER_HEX.caution
            ],
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
    if (src?.setData) src.setData(fc);
  }, [data, enabled, mapRef, opacity]);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const run = () => sync();
    if (map.isStyleLoaded()) run();
    else map.once('load', run);

    map.on('style.load', run);
    return () => {
      map.off('style.load', run);
    };
  }, [mapRef, sync]);

  // update opacity
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !enabled) return;
    if (map.getLayer(PREDICT_FILL_LAYER_ID)) {
      map.setPaintProperty(PREDICT_FILL_LAYER_ID, 'fill-opacity', opacity);
    }
  }, [enabled, opacity, mapRef]);
}
