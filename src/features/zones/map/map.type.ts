export type BaseMap = 'standard' | 'satellite';

export type MapLayerPrefs = {
  baseMap: BaseMap;
  overlays: {
    flood: boolean;
    traffic: boolean;
    weather: boolean;
  };
  opacity?: {
    flood?: number; // 0-100
    weather?: number; // 0-100
  };
};
