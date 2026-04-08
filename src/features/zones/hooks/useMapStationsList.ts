'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import { stationsApi } from '@/features/stations/api/station.api';
import { normalizeStationsPayload } from '@/features/zones/lib/normalize-station-row';

async function fetchStationsForMap(accessToken: string | undefined) {
  const res = await stationsApi.getStations(
    { page: 1, perPage: 500 },
    accessToken
  );
  return normalizeStationsPayload(res as unknown);
}

export function useMapStationsList(enabled: boolean) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['map-stations-list', accessToken?.slice(-8)],
    queryFn: () => fetchStationsForMap(accessToken ?? undefined),
    enabled,
    staleTime: 2 * 60 * 1000
  });
}
