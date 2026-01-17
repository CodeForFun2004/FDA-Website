// features/stations/types/station.type.ts

export type StationStatus = 'active' | 'offline' | 'maintenance' | string;
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
  status?: string | null; // status filter
};

export type StationUpsertPayload = {
  code: string;
  name: string;
  locationDesc: string | null;
  latitude: number;
  longitude: number;
  roadName: string | null;
  direction: string | null;
  status: StationStatus;
  thresholdWarning: number | null;
  thresholdCritical: number | null;
  installedAt: string | null;
  lastSeenAt: string | null;
};

export type CreateStationResponse = {
  success: boolean;
  message: string;
  statusCode: number;
  data: Station;
};

export type UpdateStationResponse = {
  success: boolean;
  message: string;
  statusCode: number;
};

export type DeleteStationResponse = {
  success: boolean;
  message: string;
  statusCode: number;
};
