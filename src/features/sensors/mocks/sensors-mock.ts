// src/features/sensors/mocks/sensors-mock.ts
import type { SensorReading } from "../types";

export const generateSensorData = (deviceId: string = 'dev-001'): SensorReading[] => {
    const data: SensorReading[] = [];
    const now = Date.now();

    const isRainGauge = deviceId === 'dev-002'; // Mock ID for Rain Gauge
    const isCamera = deviceId === 'dev-003';

    if (isCamera) return [];

    // Simulate 24 hours of data
    for (let i = 0; i < 24; i++) {
        const hour = i;

        if (isRainGauge) {
            // Rain Gauge Data (mm) - More spikey
            const rainEvent = i > 18 && i < 22 ? Math.random() * 15 + 5 : Math.random() * 2;
            data.push({
                id: `sr-${i}`,
                deviceId: deviceId,
                timestamp: new Date(now - (23 - i) * 3600 * 1000).toISOString(),
                type: 'Rainfall',
                value: Number(rainEvent.toFixed(1)),
                unit: 'mm'
            });
        } else {
            // Water Level Data (m) - Smooth Sine Wave
            const baseLevel = 2.0;
            const tideEffect = Math.sin(hour / 6) * 1.0;
            const randomNoise = Math.random() * 0.2;

            data.push({
                id: `sr-${i}`,
                deviceId: deviceId,
                timestamp: new Date(now - (23 - i) * 3600 * 1000).toISOString(),
                type: 'WaterLevel',
                value: Number((baseLevel + tideEffect + randomNoise).toFixed(2)),
                unit: 'm'
            });
        }
    }
    return data;
};
