// src/features/dashboard/hooks/useDashboardStats.ts
import { useDevices } from "@/features/devices";
import { useAlerts } from "@/features/alerts";
import { useZones } from "@/features/zones";
import type { DashboardStats } from "../types";

export const useDashboardStats = (): DashboardStats => {
    const { data: devices } = useDevices();
    const { data: alerts } = useAlerts();
    const { data: zones } = useZones();

    return {
        totalDevices: devices?.length || 0,
        offlineDevices: devices?.filter(d => d.status === 'Offline').length || 0,
        activeAlerts: alerts?.filter(a => a.status !== 'Resolved').length || 0,
        monitoredZones: zones?.length || 0
    };
};
