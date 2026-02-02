// src/features/routes/mocks/routes-mock.ts
import type { Route } from '../types';

export const generateRoutes = (): Route[] => [
  {
    id: 'r-1',
    name: 'Nguyen Van Linh Street - Airport',
    startPoint: 'Dragon Bridge',
    endPoint: 'Airport',
    status: 'Open',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'r-2',
    name: 'Au Co Street - Hoa Khanh',
    startPoint: 'Hue Junction',
    endPoint: 'Hoa Khanh Market',
    status: 'Blocked',
    lastUpdated: new Date().toISOString()
  }
];
