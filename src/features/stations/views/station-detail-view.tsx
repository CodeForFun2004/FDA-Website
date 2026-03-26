'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Pencil, AlertTriangle } from 'lucide-react';

import { stationsApi } from '@/features/stations/api/station.api';
import type {
  Station,
  Component,
  GetStationStatusResponse
} from '@/features/stations/types/station.type';
import { getAccessToken } from '@/features/stations/utils/auth';
import {
  generateMockStations,
  generateMockComponents,
  generateMockIncidents
} from '@/features/stations/mocks/stations-mock';
import type { MockIncident } from '@/features/stations/mocks/stations-mock';

import {
  StationSummaryCards,
  StationLocationSection,
  StationConnectionStatus,
  StationEquipmentList,
  StationIncidentTimeline,
  CalibrationConfigDialog
} from '@/features/stations/components/station-detail';

interface StationDetailViewProps {
  stationId: string;
}

export default function StationDetailView({
  stationId
}: StationDetailViewProps) {
  const router = useRouter();
  const [station, setStation] = useState<Station | null>(null);
  const [stationStatus, setStationStatus] =
    useState<GetStationStatusResponse | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [incidents, setIncidents] = useState<MockIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);

  const refreshComponents = useCallback(async () => {
    const token = await getAccessToken();
    try {
      const compRes = await stationsApi.getComponents(
        stationId,
        token ?? undefined
      );
      setComponents(compRes.components ?? []);
    } catch {
      console.warn('⚠️ Components API unavailable, using mock data');
      setComponents(
        generateMockComponents(stationId) as unknown as Component[]
      );
    }
  }, [stationId]);

  const refreshStation = useCallback(async () => {
    try {
      const res = await stationsApi.getStationById(stationId);
      setStation(res.station);
    } catch {
      // Fallback to mock data
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
    } catch (err: any) {
      console.warn('⚠️ Station Status API unavailable', err.message);
      setStationStatus(null);
    }
  }, [stationId]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch station
      await refreshStation();

      // Fetch components from real API
      await refreshComponents();

      // Fetch station status
      await refreshStationStatus();

      // Incidents still use mock for now
      setIncidents(generateMockIncidents());
      setLoading(false);
    }
    fetchData();
  }, [refreshStation, refreshStationStatus, refreshComponents]);

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='bg-muted h-10 w-64 animate-pulse rounded' />
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='bg-muted h-28 animate-pulse rounded-xl' />
          ))}
        </div>
        <div className='bg-muted h-64 animate-pulse rounded-xl' />
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
          onClick={() => router.push('/admin/stations')}
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Stations
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Fault Banner – shown when station is offline/faulty */}
      {station.status === 'offline' && (
        <div className='border-destructive bg-destructive/10 rounded-lg border-l-4 p-4'>
          <div className='flex items-center'>
            <AlertTriangle className='text-destructive mr-3 h-5 w-5 flex-shrink-0' />
            <p className='text-destructive text-sm font-medium'>
              Station is currently offline. Last seen:{' '}
              {station.lastSeenAt
                ? new Date(station.lastSeenAt).toLocaleString()
                : 'unknown'}
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => router.push('/admin/stations')}
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <h1 className='text-foreground text-2xl font-bold'>
              {station.name}
            </h1>
            <Badge className='bg-primary/10 text-primary border-primary/20 text-xs font-semibold'>
              ID: {station.code}
            </Badge>
            <div className='ml-2 flex items-center gap-1.5'>
              <Badge
                variant='outline'
                className='text-muted-foreground font-normal'
              >
                ±{station.calibrationOffset ?? 5}cm
              </Badge>
              <span className='text-muted-foreground/70 hidden text-[10px] sm:inline-block'>
                (display only)
              </span>
            </div>
          </div>
          <p className='text-muted-foreground mt-1 flex items-center pl-11'>
            <MapPin className='mr-1 h-4 w-4' />
            {station.roadName || station.locationDesc || 'Unknown location'}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsCalibrationOpen(true)}
          >
            <Pencil className='mr-2 h-4 w-4' />
            Calibration Config
          </Button>
          <Button size='sm'>Create Incident</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <StationSummaryCards station={station} stationStatus={stationStatus} />

      {/* Main Grid – Left (2/3) + Right Rail (1/3) */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Left Column */}
        <div className='space-y-6 lg:col-span-2'>
          <StationLocationSection station={station} />
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <StationConnectionStatus
              station={station}
              stationStatus={stationStatus}
              onRefresh={refreshStationStatus}
            />
            <StationEquipmentList
              stationId={stationId}
              components={components}
              onRefresh={refreshComponents}
            />
          </div>
        </div>

        {/* Right Rail */}
        <div className='lg:col-span-1'>
          <div className='lg:sticky lg:top-24'>
            <StationIncidentTimeline incidents={incidents} />
          </div>
        </div>
      </div>

      <CalibrationConfigDialog
        open={isCalibrationOpen}
        onOpenChange={setIsCalibrationOpen}
        stationId={stationId}
        onSuccess={refreshStation}
      />
    </div>
  );
}
