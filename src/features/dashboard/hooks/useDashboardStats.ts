// src/features/dashboard/hooks/useDashboardStats.ts
import { useAlerts } from '@/features/alerts';
import { useZones } from '@/features/zones';
import type { DashboardStats } from '../types';

export const useDashboardStats = (): DashboardStats => {
  const { data: alerts } = useAlerts();
  const { data: zones } = useZones();

  return {
    activeAlerts: alerts?.filter((a) => a.status !== 'Resolved').length || 0,
    monitoredZones: zones?.length || 0
  };
};
