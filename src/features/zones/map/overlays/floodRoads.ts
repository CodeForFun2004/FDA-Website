import type { Map } from 'maplibre-gl';
import type { FeatureCollection, LineString } from 'geojson';

export const FLOOD_ROADS_SOURCE_ID = 'flood-roads';
export const FLOOD_ROADS_LAYER_ID = 'flood-roads-line';
export const FLOOD_ROADS_CASING_LAYER_ID = 'flood-roads-casing';

export type FloodRoadsOverlayOptions = {
  beforeId?: string; // optional: insert under labels
};

export function getFirstSymbolLayerId(map: Map): string | undefined {
  const layers = map.getStyle()?.layers ?? [];
  return layers.find((l) => l.type === 'symbol')?.id;
}

export function ensureFloodRoadsOverlay(
  map: Map,
  data: FeatureCollection<LineString>,
  opts: FloodRoadsOverlayOptions = {}
) {
  // Source
  const existing = map.getSource(FLOOD_ROADS_SOURCE_ID) as any;
  if (existing?.setData) {
    existing.setData(data as any);
  } else {
    map.addSource(FLOOD_ROADS_SOURCE_ID, {
      type: 'geojson',
      data
    } as any);
  }

  const beforeId = opts.beforeId ?? getFirstSymbolLayerId(map);

  // Casing (outline)
  if (!map.getLayer(FLOOD_ROADS_CASING_LAYER_ID)) {
    map.addLayer(
      {
        id: FLOOD_ROADS_CASING_LAYER_ID,
        type: 'line',
        source: FLOOD_ROADS_SOURCE_ID,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': 'rgba(0,0,0,0.35)',
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 16, 10]
        }
      } as any,
      beforeId
    );
  }

  // Main line
  if (!map.getLayer(FLOOD_ROADS_LAYER_ID)) {
    map.addLayer(
      {
        id: FLOOD_ROADS_LAYER_ID,
        type: 'line',
        source: FLOOD_ROADS_SOURCE_ID,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          // level: 0..4
          'line-color': [
            'match',
            ['get', 'level'],
            0,
            '#22c55e', // dry
            1,
            '#eab308', // warning
            2,
            '#f97316', // flooded
            3,
            '#ef4444', // heavy
            4,
            '#a855f7', // impassable
            '#9ca3af' // fallback
          ],
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.5, 16, 7],
          'line-opacity': [
            'case',
            ['>', ['to-number', ['get', 'confidence']], 0.8],
            0.95,
            0.75
          ]
        }
      } as any,
      beforeId
    );
  }
}

export function setFloodRoadsVisible(map: Map, visible: boolean) {
  const v = visible ? 'visible' : 'none';
  if (map.getLayer(FLOOD_ROADS_LAYER_ID)) {
    map.setLayoutProperty(FLOOD_ROADS_LAYER_ID, 'visibility', v);
  }
  if (map.getLayer(FLOOD_ROADS_CASING_LAYER_ID)) {
    map.setLayoutProperty(FLOOD_ROADS_CASING_LAYER_ID, 'visibility', v);
  }
}

export function removeFloodRoadsOverlay(map: Map) {
  if (map.getLayer(FLOOD_ROADS_LAYER_ID)) map.removeLayer(FLOOD_ROADS_LAYER_ID);
  if (map.getLayer(FLOOD_ROADS_CASING_LAYER_ID))
    map.removeLayer(FLOOD_ROADS_CASING_LAYER_ID);
  if (map.getSource(FLOOD_ROADS_SOURCE_ID))
    map.removeSource(FLOOD_ROADS_SOURCE_ID);
}
