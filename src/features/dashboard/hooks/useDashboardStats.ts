import { useQueries } from '@tanstack/react-query';
import { stationsApi } from '@/features/stations/api/station.api';
import { getAdministrativeAreasApi } from '@/features/admin/api/admin.api';
import { getAccessToken } from '@/libs/auth-utils';
import type { DashboardStats } from '../types';

export const useDashboardStats = (): DashboardStats => {
  const results = useQueries({
    queries: [
      {
        queryKey: ['dashboard-online-stations'],
        queryFn: async () => {
          const token = await getAccessToken();
          return stationsApi.getOnlineStations(token ?? undefined);
        },
        staleTime: 60_000,
        retry: 2
      },
      {
        queryKey: ['dashboard-total-stations'],
        queryFn: () => stationsApi.getStations({ page: 1, perPage: 1 }),
        staleTime: 60_000,
        retry: 2
      },
      {
        queryKey: ['dashboard-offline-stations'],
        queryFn: async () => {
          const token = await getAccessToken();
          return stationsApi.getOfflineStations(token ?? undefined);
        },
        staleTime: 60_000,
        retry: 2
      },
      {
        queryKey: ['dashboard-admin-areas'],
        queryFn: () =>
          getAdministrativeAreasApi({ pageNumber: 1, pageSize: 1 }),
        staleTime: 60_000,
        retry: 2
      }
    ]
  });

  const [onlineQ, totalQ, offlineQ, areasQ] = results;
  const isLoading = results.some((q) => q.isLoading);

  const onlineStationIds = onlineQ.data?.items?.map((s) => s.stationId) ?? [];

  return {
    onlineStations: onlineQ.data?.total ?? 0,
    totalStations: totalQ.data?.totalCount ?? 0,
    offlineStations: offlineQ.data?.total ?? 0,
    administrativeAreas: areasQ.data?.totalCount ?? 0,
    onlineStationIds,
    isLoading,
    errors: {
      onlineStations: onlineQ.isError,
      totalStations: totalQ.isError,
      offlineStations: offlineQ.isError,
      administrativeAreas: areasQ.isError
    }
  };
};
