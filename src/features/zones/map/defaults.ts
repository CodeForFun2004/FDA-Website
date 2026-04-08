import type { MapLayerPrefs } from './map.type';

export const DEFAULT_MAP_PREFS: MapLayerPrefs = {
  baseMap: 'standard',
  overlays: {
    adminAreas: true,
    stations: false,
    traffic: false,
    weather: false
  },
  opacity: {
    flood: 80,
    weather: 70
  }
};
