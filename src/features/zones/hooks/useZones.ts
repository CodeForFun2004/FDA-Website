// src/features/zones/hooks/useZones.ts
import { useQuery } from '@tanstack/react-query';
import { generateZones } from "../mocks/zones-mock";

export const useZones = () => useQuery({
    queryKey: ['zones'],
    queryFn: async () => generateZones()
});
