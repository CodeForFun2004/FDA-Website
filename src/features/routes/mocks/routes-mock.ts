// src/features/routes/mocks/routes-mock.ts
import type { Route } from "../types";

export const generateRoutes = (): Route[] => [
    {
        id: 'r-1',
        name: 'Đường Nguyễn Văn Linh - Sân Bay',
        startPoint: 'Cầu Rồng',
        endPoint: 'Sân Bay',
        status: 'Open',
        lastUpdated: new Date().toISOString()
    },
    {
        id: 'r-2',
        name: 'Đường Âu Cơ - Hòa Khánh',
        startPoint: 'Ngã ba Huế',
        endPoint: 'Chợ Hòa Khánh',
        status: 'Blocked',
        lastUpdated: new Date().toISOString()
    },
];
