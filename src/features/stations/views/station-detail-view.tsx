'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, AlertTriangle } from 'lucide-react';

import { stationsApi } from '@/features/stations/api/station.api';
import type {
  Station,
  GetStationStatusResponse
} from '@/features/stations/types/station.type';
import { getAccessToken } from '@/features/stations/utils/auth';
import { generateMockStations } from '@/features/stations/mocks/stations-mock';

import {
  StationSummaryCards,
  StationLocationSection,
  StationRealtimeStatus,
  StationComponentsReadonly
} from '@/features/stations/components/station-detail';

interface StationDetailViewProps {
  stationId: string;
}

export default function StationDetailView({
  stationId
}: StationDetailViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const stationsIndexPath = pathname.startsWith('/moderator')
    ? '/moderator/stations'
    : '/admin/stations';
  const [station, setStation] = useState<Station | null>(null);
  const [stationStatus, setStationStatus] =
    useState<GetStationStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStation = useCallback(async () => {
    try {
      const res = await stationsApi.getStationById(stationId);
      setStation(res.station);
    } catch {
      const mock = generateMockStations().find((s) => s.id === stationId);
      if (mock) {
        setStation(mock);
      }
    }
  }, [stationId]);

  const refreshStationStatus = useCallback(async () => {
    const token = await getAccessToken();
    try {
      const statusRes = await stationsApi.getStationStatus(
        stationId,
        token ?? undefined
      );
      setStationStatus(statusRes);
    } catch (err: unknown) {
      console.warn(
        '⚠️ Station Status API unavailable',
        err instanceof Error ? err.message : err
      );
      setStationStatus(null);
    }
  }, [stationId]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      await refreshStation();
      await refreshStationStatus();
      setLoading(false);
    }
    void fetchData();
  }, [refreshStation, refreshStationStatus]);

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='bg-muted h-10 w-64 animate-pulse rounded' />
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='bg-muted h-28 animate-pulse rounded-xl' />
          ))}
        </div>
        <div className='bg-muted min-h-[22rem] animate-pulse rounded-xl' />
      </div>
    );
  }

  if (!station) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 py-20'>
        <AlertTriangle className='text-muted-foreground h-12 w-12' />
        <p className='text-muted-foreground text-lg'>Station not found</p>
        <Button
          variant='outline'
          onClick={() => router.push(stationsIndexPath)}
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Stations
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {station.status === 'offline' && (
        <div className='border-destructive bg-destructive/10 rounded-lg border-l-4 p-4'>
          <div className='flex items-center'>
            <AlertTriangle className='text-destructive mr-3 h-5 w-5 flex-shrink-0' />
            <p className='text-destructive text-sm font-medium'>
              Trạm đang mất kết nối. Lần thấy gần nhất:{' '}
              {station.lastSeenAt
                ? new Date(station.lastSeenAt).toLocaleString('vi-VN')
                : 'không xác định'}
            </p>
          </div>
        </div>
      )}

      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => router.push(stationsIndexPath)}
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <h1 className='text-foreground text-2xl font-bold'>
              {station.name}
            </h1>
            <Badge className='bg-primary/10 text-primary border-primary/20 text-xs font-semibold'>
              ID: {station.code}
            </Badge>
            <Badge
              variant='outline'
              className='text-muted-foreground ml-2 font-normal'
            >
              ±{station.calibrationOffset ?? 5}cm
            </Badge>
          </div>
          <p className='text-muted-foreground mt-1 flex items-center pl-11'>
            <MapPin className='mr-1 h-4 w-4' />
            {station.roadName ||
              station.locationDesc ||
              'Chưa có thông tin vị trí'}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='space-y-6 lg:col-span-2'>
          <StationSummaryCards
            station={station}
            stationStatus={stationStatus}
            onRefreshStatus={() => void refreshStationStatus()}
          />

          <StationLocationSection station={station} />
        </div>

        <aside className='space-y-6 lg:sticky lg:top-6 lg:col-span-1 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto'>
          <StationRealtimeStatus station={station} />
          <StationComponentsReadonly stationId={station.id} />
        </aside>
      </div>
    </div>
  );
}
