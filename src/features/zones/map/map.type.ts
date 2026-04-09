export type BaseMap = 'standard' | 'satellite';

export type MapLayerPrefs = {
  baseMap: BaseMap;
  overlays: {
    adminAreas: boolean;
    stations: boolean;
    /** Phản ánh cộng đồng (GET flood-reports/community) — z-order: trên stations, dưới admin. */
    communityReports: boolean;
    traffic: boolean;
    weather: boolean;
  };
  opacity?: {
    flood?: number; // 0-100
    weather?: number; // 0-100
  };
};
