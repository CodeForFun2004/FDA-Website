// src/features/devices/mocks/devices-mock.ts
import type { Device } from '../types';

export const generateDevices = (): Device[] => [
  {
    id: 'dev-001',
    name: 'Me Suot Sensor A1',
    type: 'Ultrasonic',
    model: 'JSN-SR04T',
    location: 'Lien Chieu',
    status: 'Online',
    batteryLevel: 85,
    lastHeartbeat: new Date().toISOString(),
    installationHeight: 6.0,
    calibrationOffset: 0.1,
    coordinates: [16.0583, 108.1632]
  },
  {
    id: 'dev-002',
    name: 'Cam Le Rain Gauge',
    type: 'Rain Gauge',
    model: 'RK400-01',
    location: 'Cam Le',
    status: 'Online',
    batteryLevel: 92,
    lastHeartbeat: new Date().toISOString(),
    coordinates: [16.0197, 108.2096]
  },
  {
    id: 'dev-003',
    name: 'Son Tra Cam',
    type: 'Camera',
    model: 'Hikvision IP',
    location: 'Son Tra',
    status: 'Offline',
    batteryLevel: 0,
    lastHeartbeat: new Date(Date.now() - 86400000).toISOString(),
    coordinates: [16.082, 108.2435]
  },
  {
    id: 'dev-004',
    name: 'Hoa Vang Sensor B2',
    type: 'Multi-sensor',
    model: 'ESP32-Custom',
    location: 'Hoa Vang',
    status: 'Warning',
    batteryLevel: 15,
    lastHeartbeat: new Date(Date.now() - 1800000).toISOString(),
    installationHeight: 5.5,
    calibrationOffset: 0.0,
    coordinates: [16.05, 108.08]
  }
];
