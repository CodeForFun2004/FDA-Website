// src/features/zones/mocks/zones-mock.ts
import type { Zone } from '../types';

// Updated Zones to cover ALL Districts of Da Nang
export const generateZones = (): Zone[] => [
  // 1. Lien Chieu District (High Risk Area usually)
  {
    id: 'z-lienchieu',
    name: 'Lien Chieu District',
    type: 'District',
    riskLevel: 'Flooded',
    deviceCount: 12,
    population: 170000,
    coordinates: [
      [16.14, 108.1],
      [16.14, 108.15],
      [16.08, 108.17],
      [16.05, 108.14],
      [16.08, 108.08]
    ],
    center: [16.09, 108.13],
    details: 'Major flood-prone area, especially around Hoa Khanh and Me Suot.'
  },
  // 2. Thanh Khe District
  {
    id: 'z-thanhkhe',
    name: 'Thanh Khe District',
    type: 'District',
    riskLevel: 'Watch',
    deviceCount: 10,
    population: 180000,
    coordinates: [
      [16.07, 108.17],
      [16.075, 108.195],
      [16.055, 108.2],
      [16.045, 108.175]
    ],
    center: [16.06, 108.185],
    details: 'Localized flooding risk around Khe Can.'
  },
  // 3. Hai Chau District (Center)
  {
    id: 'z-haichau',
    name: 'Hai Chau District',
    type: 'District',
    riskLevel: 'Safe',
    deviceCount: 15,
    population: 200000,
    coordinates: [
      [16.08, 108.21],
      [16.085, 108.225],
      [16.03, 108.22],
      [16.035, 108.2]
    ],
    center: [16.06, 108.215],
    details: 'Administrative center with relatively good drainage.'
  },
  // 4. Son Tra District (Peninsula)
  {
    id: 'z-sontra',
    name: 'Son Tra District',
    type: 'District',
    riskLevel: 'Safe',
    deviceCount: 8,
    population: 150000,
    coordinates: [
      [16.12, 108.23],
      [16.12, 108.3],
      [16.06, 108.26],
      [16.065, 108.23]
    ],
    center: [16.09, 108.25],
    details: 'Higher terrain, low flooding, watch for peninsula landslides.'
  },
  // 5. Ngu Hanh Son District
  {
    id: 'z-nguhanhson',
    name: 'Ngu Hanh Son District',
    type: 'District',
    riskLevel: 'Watch',
    deviceCount: 6,
    population: 90000,
    coordinates: [
      [16.06, 108.23],
      [16.06, 108.26],
      [15.98, 108.28],
      [15.98, 108.24]
    ],
    center: [16.02, 108.25],
    details: 'Co Co river area with tidal flooding risk.'
  },
  // 6. Cam Le District
  {
    id: 'z-camle',
    name: 'Cam Le District',
    type: 'District',
    riskLevel: 'Watch',
    deviceCount: 9,
    population: 140000,
    coordinates: [
      [16.04, 108.17],
      [16.035, 108.22],
      [15.99, 108.21],
      [16.0, 108.16]
    ],
    center: [16.015, 108.19],
    details: 'Low-lying area in the south of the city.'
  },
  // 7. Hoa Vang District (Large outer area)
  {
    id: 'z-hoavang',
    name: 'Hoa Vang District',
    type: 'District',
    riskLevel: 'Flooded',
    deviceCount: 20,
    population: 200000,
    coordinates: [
      [16.15, 108.05],
      [16.15, 108.1],
      [16.0, 108.16],
      [15.95, 108.2],
      [15.95, 108.0]
    ],
    center: [16.05, 108.08],
    details: 'Large rural area, often flooded by upstream flows.'
  },
  // Flood Hotspots (Points)
  {
    id: 'z-hotspot-1',
    name: 'Me Suot Street',
    type: 'Custom',
    riskLevel: 'Flooded',
    deviceCount: 2,
    population: 5000,
    coordinates: [],
    center: [16.0583, 108.1632], // Near Da Nang University of Education
    details: 'Severe localized flooding > 1m during heavy rain.'
  },
  {
    id: 'z-hotspot-2',
    name: 'Khe Can - Thanh Khe',
    type: 'Custom',
    riskLevel: 'Watch',
    deviceCount: 1,
    population: 3000,
    coordinates: [],
    center: [16.062, 108.181],
    details: 'Low-lying area with slow drainage.'
  },
  {
    id: 'z-hotspot-3',
    name: 'Hoa Khanh Nam',
    type: 'Custom',
    riskLevel: 'Flooded',
    deviceCount: 3,
    population: 8000,
    coordinates: [],
    center: [16.075, 108.15],
    details: 'Widespread flooding from mountain runoff.'
  }
];
