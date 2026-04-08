'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import { stationsApi } from '@/features/stations/api/station.api';
import type {
  GetStationsResponse,
  StationExtended
} from '@/features/stations/types/station.type';
import { normalizeStationsPayload } from '@/features/zones/lib/normalize-station-row';

/** Backend thường giới hạn pageSize (vd. max 100) — gọi 500 → 400. */
const MAP_STATIONS_PAGE_SIZE = 100;

async function fetchStationsForMap(
  accessToken: string | undefined
): Promise<StationExtended[]> {
  const all: StationExtended[] = [];
  let page = 1;

  for (;;) {
    const res = (await stationsApi.getStations(
      { page, perPage: MAP_STATIONS_PAGE_SIZE },
      accessToken
    )) as GetStationsResponse;
    const batch = normalizeStationsPayload(res as unknown);
    all.push(...batch);
    const total = res.totalCount ?? 0;
    if (
      batch.length < MAP_STATIONS_PAGE_SIZE ||
      all.length >= total ||
      batch.length === 0
    ) {
      break;
    }
    page += 1;
    if (page > 100) break;
  }

  return all;
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
