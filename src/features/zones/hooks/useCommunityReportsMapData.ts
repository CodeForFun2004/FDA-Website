'use client';

import { useQuery } from '@tanstack/react-query';
import type { FeatureCollection } from 'geojson';
import * as React from 'react';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import { fetchCommunityFloodReports } from '../api/flood-reports-community.api';
import {
  FLOOD_TIER_HEX,
  tierFromSeverityString
} from '../lib/flood-severity-ui';

const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] };

function markerColorForSeverity(sev?: string | null): string {
  const t = tierFromSeverityString((sev ?? '').toLowerCase());
  if (t) return FLOOD_TIER_HEX[t];
  return FLOOD_TIER_HEX.caution;
}

export function useCommunityReportsMapData(enabled: boolean) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: ['flood-reports-community', accessToken?.slice(-8)],
    queryFn: () => fetchCommunityFloodReports(accessToken ?? undefined),
    enabled,
    staleTime: 2 * 60 * 1000
  });

  const featureCollection = React.useMemo((): FeatureCollection => {
    const rows = query.data ?? [];
    if (!rows.length) return EMPTY;

    return {
      type: 'FeatureCollection',
      features: rows.map((r) => ({
        type: 'Feature' as const,
        id: r.id,
        geometry: {
          type: 'Point' as const,
          coordinates: [r.longitude, r.latitude]
        },
        properties: {
          id: r.id,
          description: r.description ?? '',
          address: r.address ?? '',
          severity: (r.severity ?? 'unknown').toLowerCase(),
          status: r.status ?? '',
          trustScore: r.trustScore ?? null,
          priority: r.priority ?? '',
          createdAt: r.createdAt ?? '',
          markerColor: markerColorForSeverity(r.severity)
        }
      }))
    };
  }, [query.data]);

  return { ...query, featureCollection };
}
