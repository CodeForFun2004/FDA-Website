// src/features/alerts/types.ts
export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  message: string;
  zone: string;
  stationName: string;
  stationAddress: string;
  timestamp: string;
  status: 'New' | 'Acknowledged' | 'Resolved';
  coordinates?: [number, number]; // [lat, lng] for map marker
  isRead?: boolean;
  resolvedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  sensorType?: string;
  sensorValue?: number;
  sensorUnit?: string;
  thresholdValue?: number;
}
