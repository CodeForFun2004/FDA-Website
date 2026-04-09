// features/stations/types/station.type.ts

export type StationStatus = 'online' | 'offline' | 'maintenance';
export type StationDirection =
  | 'upstream'
  | 'downstream'
  | 'road section'
  | string;

export interface Station {
  id: string;
  code: string;
  name: string;
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
  createdAt: string;
  updatedAt: string;
}

/** Các cột bổ sung từ DB (API có thể trả camelCase hoặc PascalCase — normalize ở map layer). */
export interface StationExtended extends Station {
  administrativeAreaId?: string | null;
  type?: string | null;
  isIncidentActive?: boolean | null;
  sensorHeight?: number | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

/** Base envelope backend tra ve */
export interface ApiEnvelope {
  success: boolean;
  message: string;
  statusCode: number;
}

/** GET all stations */
export interface GetStationsResponse extends ApiEnvelope {
  stations: Station[] | StationExtended[];
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
// Calibration Config types (FE-33)
// ============================================================

export interface GetCalibrationResponse extends ApiEnvelope {
  stationId: string;
  calibrationOffset: number;
  updatedAt: string;
  updatedBy: string;
}

export interface UpdateCalibrationResponse extends ApiEnvelope {
  stationId: string;
  calibrationOffset: number;
  updatedAt: string;
  updatedBy: string;
}

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

// ============================================================
// Station Status APIs (FE-32)
// ============================================================

export interface GetStationStatusResponse extends ApiEnvelope {
  stationId: string;
  stationName: string;
  status: StationStatus;
  lastSeenAt: string | null;
  batteryLevel: number | null;
  signalStrength: number | null;
  lastReading: {
    waterLevel: number | null;
    measuredAt: string | null;
  } | null;
  offlineDurationMinutes: number | null;
}

export interface OnlineStationItem {
  stationId: string;
  stationName: string;
  lastSeenAt: string | null;
  batteryLevel: number | null;
  signalStrength: number | null;
}

export interface GetOnlineStationsResponse extends ApiEnvelope {
  items: OnlineStationItem[];
  total: number;
}

export interface OfflineStationItem {
  stationId: string;
  stationName: string;
  lastSeenAt: string | null;
  offlineDurationMinutes: number | null;
}

export interface GetOfflineStationsResponse extends ApiEnvelope {
  items: OfflineStationItem[];
  total: number;
}
