// src/features/devices/hooks/useDevices.ts
import { useQuery } from '@tanstack/react-query';
import { generateDevices } from "../mocks/devices-mock";

export const useDevices = () => useQuery({
    queryKey: ['devices'],
    queryFn: async () => generateDevices()
});
