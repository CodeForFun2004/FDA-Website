// src/features/alerts/mocks/alerts-mock.ts
import type { Alert } from '../types';

export const generateAlerts = (): Alert[] => [
  {
    id: 'al-1',
    severity: 'High',
    message: 'Water level rising 0.5m',
    zone: 'Me Suot Street',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'New',
    coordinates: [16.0583, 108.1632]
  },
  {
    id: 'al-2',
    severity: 'Medium',
    message: 'Localized heavy rain',
    zone: 'Hoa Vang',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: 'Acknowledged',
    coordinates: [16.01, 108.15]
  }
];
