// src/features/devices/types.ts
export interface Device {
    id: string;
    name: string;
    type: 'Ultrasonic' | 'Rain Gauge' | 'Camera' | 'Multi-sensor';
    model?: string; // e.g. JSN-SR04T
    location: string;
    status: 'Online' | 'Offline' | 'Warning';
    batteryLevel: number;
    lastHeartbeat: string;
    installationHeight?: number; // Distance from sensor to ground/riverbed in meters
    calibrationOffset?: number;
    coordinates?: [number, number]; // [lat, lng]
}
