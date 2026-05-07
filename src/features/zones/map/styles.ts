import type { BaseMap } from '../map/map.type';
import type { FeatureCollection } from 'geojson';
import type { Map, StyleSpecification } from 'maplibre-gl';

const VN_NAME_OVERRIDE_SOURCE_ID = 'vn-name-override';
export const VN_NAME_OVERRIDE_LAYER_ID = 'vn-name-override-labels';

const VN_NAME_OVERRIDE_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [112.0, 16.5] },
      properties: { name: 'Quần đảo Hoàng Sa' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [114.35, 10.0] },
      properties: { name: 'Quần đảo Trường Sa' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [111.0, 12.0] },
      properties: { name: 'Biển Đông' }
    }
  ]
};

export function applyVietnameseNameOverlay(map: Map) {
  // idempotent: safe to call after setStyle/style.load
  try {
    if (!map.getSource(VN_NAME_OVERRIDE_SOURCE_ID)) {
      map.addSource(VN_NAME_OVERRIDE_SOURCE_ID, {
        type: 'geojson',
        data: VN_NAME_OVERRIDE_GEOJSON
      });
    }

    if (!map.getLayer(VN_NAME_OVERRIDE_LAYER_ID)) {
      map.addLayer({
        id: VN_NAME_OVERRIDE_LAYER_ID,
        type: 'symbol',
        source: VN_NAME_OVERRIDE_SOURCE_ID,
        minzoom: 3,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3,
            16,
            6,
            20,
            10,
            28
          ],
          'text-anchor': 'center',
          'text-letter-spacing': 0.12,
          'text-allow-overlap': true,
          'text-ignore-placement': true,
          'symbol-sort-key': 999
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': 'rgba(36,59,94,0.95)',
          'text-halo-width': 3,
          'text-halo-blur': 0.8
        }
      });
    }
  } catch {
    // ignore: style might not be ready or map is disposing
  }
}

export function setVietnameseNameOverlayVisible(map: Map, visible: boolean) {
  try {
    if (!map.getLayer(VN_NAME_OVERRIDE_LAYER_ID)) return;
    map.setLayoutProperty(
      VN_NAME_OVERRIDE_LAYER_ID,
      'visibility',
      visible ? 'visible' : 'none'
    );
  } catch {
    // ignore
  }
}

export function getBaseStyle(baseMap: BaseMap): string | StyleSpecification {
  if (baseMap === 'standard') {
    // MapLibre with OpenStreetMap - No API key required!
    return {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      },
      layers: [
        {
          id: 'osm-tiles',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const tiles = token
    ? [
        `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.jpg90?access_token=${token}`
      ]
    : [];

  // ✅ quan trọng: version phải là literal 8
  const style: StyleSpecification = {
    version: 8,
    name: 'Satellite',
    sources: {
      satellite: {
        type: 'raster',
        tiles,
        tileSize: 256
      }
    },
    layers: [
      {
        id: 'satellite',
        type: 'raster',
        source: 'satellite'
      }
    ]
  };

  return style;
}
