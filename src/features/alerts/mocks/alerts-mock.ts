// src/features/alerts/mocks/alerts-mock.ts
import type { Alert } from "../types";

export const generateAlerts = (): Alert[] => [
    {
        id: 'al-1',
        severity: 'High',
        message: 'Nước dâng cao 0.5m',
        zone: 'Đường Mẹ Suốt',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'New',
        coordinates: [16.0583, 108.1632]
    },
    {
        id: 'al-2',
        severity: 'Medium',
        message: 'Mưa lớn cục bộ',
        zone: 'Hòa Vang',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        status: 'Acknowledged',
        coordinates: [16.0100, 108.1500]
    },
];
