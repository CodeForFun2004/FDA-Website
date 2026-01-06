// src/features/sensors/hooks/useSensorReadings.ts
import { useQuery } from '@tanstack/react-query';
import { generateSensorData } from "../mocks/sensors-mock";

export const useSensorReadings = (deviceId?: string) => useQuery({
    queryKey: ['sensorReadings', deviceId],
    queryFn: async () => generateSensorData(deviceId)
});
