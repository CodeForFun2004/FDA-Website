// src/features/zones/types.ts
export interface Zone {
    id: string;
    name: string;
    type: 'District' | 'Ward' | 'Custom';
    riskLevel: 'Safe' | 'Watch' | 'Flooded';
    deviceCount: number;
    population?: number;
    coordinates?: [number, number][]; // Array of [lat, lng] points for SVG polygon
    center?: [number, number]; // [lat, lng] for label placement
    details?: string;
}
