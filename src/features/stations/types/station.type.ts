// features/stations/types/station.type.ts

export type StationStatus = 'active' | 'offline' | 'maintenance' | string;
export type StationDirection =
  | 'upstream'
  | 'downstream'
  | 'road section'
  | string;
export type StationType =
  | 'urban_lowland'
  | 'riverbank'
  | 'drainage'
  | 'floodgate'
  | string;

export interface Station {
  id: string;
  code: string;
  name: string;
  type: StationType;
  locationDesc: string | null;
  latitude: number;
  longitude: number;
  roadName: string | null;
  direction: StationDirection | null;
  status: StationStatus;
  thresholdWarning: number | null;
  thresholdCritical: number | null;
  calibrationOffset: number | null;
  installedAt: string | null;
  lastSeenAt: string | null;
  administrativeAreaId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Base envelope backend tra ve */
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

export type StationListFilters = {
  page: number;
  perPage: number;
  name?: string | null;
  status?: string | null;
  searchTerm?: string | null;
};

export type StationUpsertPayload = {
  code: string;
  name: string;
  type?: StationType | null;
  locationDesc: string | null;
  latitude: number;
  longitude: number;
  roadName: string | null;
  direction: string | null;
  status: StationStatus;
  thresholdWarning: number | null;
  thresholdCritical: number | null;
  calibrationOffset?: number | null;
  installedAt: string | null;
  lastSeenAt: string | null;
  administrativeAreaId: string;
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

// ============================================================
// Component types (FE-31)
// ============================================================

export type ComponentStatus = 'active' | 'inactive' | 'faulty' | string;

export type ComponentType =
  | 'esp32'
  | 'srt04'
  | 'temperature_sensor'
  | 'battery'
  | 'speaker'
  | 'gsm_module'
  | 'solar_panel'
  | 'rain_sensor'
  | string;

export interface Component {
  id: string;
  stationId: string;
  componentType: ComponentType;
  name: string;
  model: string | null;
  serialNumber: string | null;
  firmwareVersion: string | null;
  status: ComponentStatus;
  installedAt: string | null;
  lastMaintenanceAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetComponentsResponse extends ApiEnvelope {
  components: Component[];
}

export interface GetComponentByIdResponse extends ApiEnvelope {
  component: Component;
}

export type ComponentUpsertPayload = {
  componentType: ComponentType;
  name?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  firmwareVersion?: string | null;
  status?: ComponentStatus | null;
  notes?: string | null;
};

export type CreateComponentResponse = {
  success: boolean;
  message: string;
  statusCode: number;
  id: string;
  component: Component;
};

export type UpdateComponentResponse = {
  success: boolean;
  message: string;
  statusCode: number;
};

export type DeleteComponentResponse = {
  success: boolean;
  message: string;
  statusCode: number;
};
