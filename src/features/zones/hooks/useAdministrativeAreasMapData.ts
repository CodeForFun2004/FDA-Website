'use client';

import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import type { FeatureCollection } from 'geojson';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import { fetchAllAdministrativeAreas } from '../api/administrative-areas.api';
import { administrativeAreasToFeatureCollection } from '../lib/ewkb-hex-to-geojson';

const EMPTY_FC: FeatureCollection = { type: 'FeatureCollection', features: [] };

export function useAdministrativeAreasMapData() {
  const accessToken = useAuthStore((s) => s.accessToken);

  /** Có Bearer thì mới gọi `/admin/administrative-areas` (tránh 401 + redirect vô ích). */
  const canFetch = typeof accessToken === 'string' && accessToken.length > 0;

  const query = useQuery({
    queryKey: ['administrative-areas', 'map', 'ward', accessToken?.slice(-12)],
    queryFn: () =>
      fetchAllAdministrativeAreas({ level: 'ward', pageSize: 100 }),
    staleTime: 10 * 60 * 1000,
    retry: 1,
    enabled: canFetch
  });

  const featureCollection = React.useMemo((): FeatureCollection => {
    if (!query.data?.length) return EMPTY_FC;
    return administrativeAreasToFeatureCollection(query.data);
  }, [query.data]);

  return { ...query, featureCollection, canFetch };
}
