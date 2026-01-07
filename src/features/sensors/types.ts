// src/features/sensors/types.ts
export interface SensorReading {
    id: string;
    deviceId: string;
    timestamp: string;
    type: 'WaterLevel' | 'Rainfall' | 'Temperature';
    value: number;
    unit: string;
}
