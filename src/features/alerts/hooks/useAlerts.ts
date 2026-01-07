// src/features/alerts/hooks/useAlerts.ts
import { useQuery } from '@tanstack/react-query';
import { generateAlerts } from "../mocks/alerts-mock";

export const useAlerts = () => useQuery({
    queryKey: ['alerts'],
    queryFn: async () => generateAlerts()
});
