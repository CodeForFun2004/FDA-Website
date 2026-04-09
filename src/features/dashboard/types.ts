export type DashboardStats = {
  onlineStations: number;
  totalStations: number;
  offlineStations: number;
  administrativeAreas: number;
  onlineStationIds: string[];
  isLoading: boolean;
  errors: {
    onlineStations: boolean;
    totalStations: boolean;
    offlineStations: boolean;
    administrativeAreas: boolean;
  };
};

export type GeoLocation = {
  lat: number;
  lng: number;
};
