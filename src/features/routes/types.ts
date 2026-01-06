// src/features/routes/types.ts
export interface Route {
    id: string;
    name: string;
    startPoint: string;
    endPoint: string;
    status: 'Open' | 'Risky' | 'Blocked';
    lastUpdated: string;
}

export interface RouteAnalysis {
    id: string;
    type: 'Safest' | 'Fastest' | 'Alternative';
    routeIndex: number; // 0, 1, 2 corresponding to Google Maps route array
    summary: string;
    distance: string;
    duration: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    warnings: string[];
    pathNote: string;
}
