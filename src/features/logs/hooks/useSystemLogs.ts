// src/features/logs/hooks/useSystemLogs.ts
import { useQuery } from '@tanstack/react-query';
import { generateLogs } from "../mocks/logs-mock";

export const useSystemLogs = () => useQuery({
    queryKey: ['logs'],
    queryFn: async () => generateLogs()
});
