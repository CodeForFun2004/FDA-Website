// src/features/routes/hooks/useRoutes.ts
import { useQuery } from '@tanstack/react-query';
import { generateRoutes } from "../mocks/routes-mock";

export const useRoutes = () => useQuery({
    queryKey: ['routes'],
    queryFn: async () => generateRoutes()
});
