// features/stations/types/station.type.ts

export type StationStatus = 'active' | 'inactive' | 'maintenance' | string;
export type StationDirection =
  | 'upstream'
  | 'downstream'
  | 'road section'
  | string;

export interface Station {
  id: string;

  code: string;
  name: string;

  locationDesc: string;
  latitude: number;
  longitude: number;

  roadName: string;
  direction: StationDirection;

  status: StationStatus;

  thresholdWarning: number | null;
  thresholdCritical: number | null;

  installedAt: string | null;
  lastSeenAt: string | null;

  createdAt: string;
  updatedAt: string;
}

/** Base envelope backend trả về */
export interface ApiEnvelope {
  success: boolean;
  message: string;
  statusCode: number;
}

/** GET all stations */
export interface GetStationsResponse extends ApiEnvelope {
  stations: Station[];
  totalCount: number;
}

/** GET station by id */
export interface GetStationByIdResponse extends ApiEnvelope {
  station: Station;
}

/** Filters map với searchParamsCache */
export type StationListFilters = {
  page: number;
  perPage: number;
  name?: string | null; // search keyword
};
