// src/features/stations/mocks/stations-mock.ts
import type { Station } from '../types/station.type';

export const generateMockStations = (): Station[] => [
  {
    id: 'st-001',
    code: 'ST_DN_001',
    name: 'Nguyen Trai Station',
    locationDesc: 'Next to Nguyen Trai drainage gate',
    latitude: 10.8231,
    longitude: 106.6297,
    roadName: '324 Nguyen Trai Street, Thanh Xuan District',
    direction: 'downstream',
    status: 'online',
    thresholdWarning: 2.5,
    thresholdCritical: 3.0,
    calibrationOffset: 2.4,
    installedAt: '2024-01-15T10:30:00Z',
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-07-20T09:15:00Z'
  },
  {
    id: 'st-002',
    code: 'ST_DN_005',
    name: 'Kim Ma Station',
    locationDesc: 'Kim Ma - Lien Chieu intersection',
    latitude: 16.0611,
    longitude: 108.2194,
    roadName: 'Kim Ma Street, Lien Chieu District',
    direction: 'upstream',
    status: 'maintenance',
    thresholdWarning: 1.8,
    thresholdCritical: 2.5,
    calibrationOffset: 0.0,
    installedAt: '2024-02-20T08:00:00Z',
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    createdAt: '2024-02-20T08:00:00Z',
    updatedAt: '2024-06-01T14:00:00Z'
  },
  {
    id: 'st-003',
    code: 'ST_DN_012',
    name: 'Cau Giay Station',
    locationDesc: 'Xuan Thuy street, Cau Giay District',
    latitude: 21.0333,
    longitude: 105.7833,
    roadName: 'Xuan Thuy Street, Cau Giay District',
    direction: 'downstream',
    status: 'offline',
    thresholdWarning: 3.0,
    thresholdCritical: 4.0,
    calibrationOffset: -1.2,
    installedAt: '2024-03-10T12:00:00Z',
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    createdAt: '2024-03-10T12:00:00Z',
    updatedAt: '2024-07-18T10:00:00Z'
  },
  {
    id: 'st-004',
    code: 'ST_DN_003',
    name: 'Tran Phu Station',
    locationDesc: 'Tran Phu floodgate area',
    latitude: 16.0547,
    longitude: 108.215,
    roadName: 'Tran Phu Street, Hai Chau District',
    direction: 'upstream',
    status: 'online',
    thresholdWarning: 1.5,
    thresholdCritical: 2.0,
    calibrationOffset: 5.0,
    installedAt: '2024-01-20T09:00:00Z',
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-07-19T11:30:00Z'
  },
  {
    id: 'st-005',
    code: 'ST_HCM_001',
    name: 'Thu Duc Station',
    locationDesc: 'Thu Duc university area',
    latitude: 10.8702,
    longitude: 106.7766,
    roadName: 'Dien Bien Phu Street, Thu Duc District',
    direction: 'downstream',
    status: 'online',
    thresholdWarning: 2.0,
    thresholdCritical: 3.5,
    calibrationOffset: 3.0,
    installedAt: '2024-04-01T14:00:00Z',
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    createdAt: '2024-04-01T14:00:00Z',
    updatedAt: '2024-07-21T08:00:00Z'
  }
];

// ---------- Mock Components for station detail (FE-31) ----------

export interface MockComponent {
  id: string;
  stationId: string;
  componentType: string;
  name: string;
  model: string | null;
  firmwareVersion: string | null;
  status: 'online' | 'inactive' | 'faulty';
}

export const generateMockComponents = (stationId: string): MockComponent[] => [
  {
    id: `comp-${stationId}-1`,
    stationId,
    componentType: 'esp32',
    name: 'RTU - Module',
    model: 'ESP32-WROOM',
    firmwareVersion: 'v2.1.0-main',
    status: 'online'
  },
  {
    id: `comp-${stationId}-2`,
    stationId,
    componentType: 'srt04',
    name: 'Ultrasonic Sensor',
    model: 'US-200',
    firmwareVersion: null,
    status: 'online'
  },
  {
    id: `comp-${stationId}-3`,
    stationId,
    componentType: 'temperature_sensor',
    name: 'Temperature Sensor',
    model: 'DS18B20',
    firmwareVersion: null,
    status: 'online'
  },
  {
    id: `comp-${stationId}-4`,
    stationId,
    componentType: 'battery',
    name: 'Battery Module',
    model: 'LiFePO4 12V 20Ah',
    firmwareVersion: null,
    status: 'faulty'
  },
  {
    id: `comp-${stationId}-5`,
    stationId,
    componentType: 'gsm_module',
    name: 'Surveillance Camera',
    model: 'C-04 Network',
    firmwareVersion: null,
    status: 'inactive'
  }
];

// ---------- Mock Incidents for station detail (FE-31) ----------

export interface MockIncident {
  id: string;
  type: 'maintenance' | 'alert' | 'power' | 'sensor';
  title: string;
  description: string;
  date: string;
}

export const generateMockIncidents = (): MockIncident[] => [
  {
    id: 'inc-001',
    type: 'maintenance',
    title: 'Scheduled maintenance',
    description: 'Completed by Technician A',
    date: '2025-10-15'
  },
  {
    id: 'inc-002',
    type: 'alert',
    title: 'Water level threshold exceeded',
    description: 'Automatic notification sent',
    date: '2025-10-12'
  },
  {
    id: 'inc-003',
    type: 'power',
    title: 'Grid power outage',
    description: 'Switched to backup battery',
    date: '2025-10-05'
  },
  {
    id: 'inc-004',
    type: 'sensor',
    title: 'Sensor calibration drift',
    description: 'Auto-corrected within ±2cm',
    date: '2025-09-28'
  }
];
