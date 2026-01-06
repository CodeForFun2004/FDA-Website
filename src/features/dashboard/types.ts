// src/features/dashboard/types.ts
export type DashboardStats = {
    totalDevices: number;
    offlineDevices: number;
    activeAlerts: number;
    monitoredZones: number;
};

export type GeoLocation = {
    lat: number;
    lng: number;
};
