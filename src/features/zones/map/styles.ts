import type { BaseMap } from '../map/map.type';
import type { StyleSpecification } from 'maplibre-gl';

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
