// src/features/alerts/types.ts
export interface Alert {
    id: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    message: string;
    zone: string;
    timestamp: string;
    status: 'New' | 'Acknowledged' | 'Resolved';
    coordinates?: [number, number]; // [lat, lng] for map marker
}
