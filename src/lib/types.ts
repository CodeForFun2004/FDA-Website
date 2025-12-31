export type Role = 'Admin' | 'Operator' | 'Viewer' | 'Mobile';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Inactive';
  createdAt: string;
  lastLogin: string;
}

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
  coordinates?: [number, number]; // [x, y] on the mock map
}

export interface SensorReading {
  id: string;
  deviceId: string;
  timestamp: string;
  type: 'WaterLevel' | 'Rainfall' | 'Temperature';
  value: number;
  unit: string;
}

export interface Alert {
  id: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  message: string;
  zone: string;
  timestamp: string;
  status: 'New' | 'Acknowledged' | 'Resolved';
  coordinates?: [number, number]; // [x, y] for map marker
}

export interface Route {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  status: 'Open' | 'Risky' | 'Blocked';
  lastUpdated: string;
}

export interface Zone {
  id: string;
  name: string;
  type: 'District' | 'Ward' | 'Custom';
  riskLevel: 'Safe' | 'Watch' | 'Flooded';
  deviceCount: number;
  population?: number;
  coordinates?: [number, number][]; // Array of [x, y] points for SVG polygon
  center?: [number, number]; // [x, y] for label placement
  details?: string;
}

export interface RouteAnalysis {
  id: string;
  type: 'Safest' | 'Fastest' | 'Alternative';
  routeIndex: number; // 0, 1, 2 corresponding to Google Maps route array
  summary: string;
  distance: string;
  duration: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  warnings: string[];
  pathNote: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  source: 'System' | 'User' | 'Sensor' | 'Alert';
  action: string; // e.g., "Login", "Threshold Exceeded", "Device Offline"
  details: string;
  userOrDeviceId?: string;
}