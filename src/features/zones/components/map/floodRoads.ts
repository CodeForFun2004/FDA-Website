import type maplibregl from 'maplibre-gl';
import type { FeatureCollection, LineString } from 'geojson';

export const FLOOD_ROADS_SOURCE_ID = 'flood-roads';
export const FLOOD_ROADS_LAYER_ID = 'flood-roads-line';
export const FLOOD_ROADS_CASING_LAYER_ID = 'flood-roads-casing';

function getFirstSymbolLayerId(map: maplibregl.Map): string | undefined {
  const layers = map.getStyle()?.layers ?? [];
  return layers.find((l) => l.type === 'symbol')?.id;
}

export function ensureFloodRoadsOverlay(
  map: maplibregl.Map,
  data: FeatureCollection<LineString>,
  opts?: { beforeLayerId?: string }
) {
  // Source
  const src = map.getSource(FLOOD_ROADS_SOURCE_ID) as any;
  if (src?.setData) {
    src.setData(data);
  } else {
    map.addSource(FLOOD_ROADS_SOURCE_ID, {
      type: 'geojson',
      data
    } as any);
  }

  const beforeId = opts?.beforeLayerId ?? getFirstSymbolLayerId(map);

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

  // Main flood roads line
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
            '#f97316', // flooded (medium)
            3,
            '#ef4444', // heavy
            4,
            '#a855f7', // impassable
            '#9ca3af' // fallback
          ],
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.5, 16, 7],
          'line-opacity': 0.95
        }
      } as any,
      beforeId
    );
  }
}

export function removeFloodRoadsOverlay(map: maplibregl.Map) {
  if (map.getLayer(FLOOD_ROADS_LAYER_ID)) map.removeLayer(FLOOD_ROADS_LAYER_ID);
  if (map.getLayer(FLOOD_ROADS_CASING_LAYER_ID))
    map.removeLayer(FLOOD_ROADS_CASING_LAYER_ID);

  if (map.getSource(FLOOD_ROADS_SOURCE_ID))
    map.removeSource(FLOOD_ROADS_SOURCE_ID);
}
