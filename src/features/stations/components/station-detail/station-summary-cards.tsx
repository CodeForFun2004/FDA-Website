'use client';

import { Card, CardContent } from '@/components/ui/card';
import type {
  Station,
  GetStationStatusResponse
} from '@/features/stations/types/station.type';
import { CheckCircle2, Info, Settings2, AlertTriangle } from 'lucide-react';

interface StationSummaryCardsProps {
  station: Station;
  stationStatus?: GetStationStatusResponse | null;
}

export function StationSummaryCards({
  station,
  stationStatus
}: StationSummaryCardsProps) {
  const isActive =
    station.status === 'online' || (station.status as string) === 'active';
  const statusText = isActive
    ? 'Online'
    : station.status === 'maintenance'
      ? 'Maintenance'
      : 'Offline';

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {/* Card 1 – Device Status */}
      <Card className='border-border bg-card'>
        <CardContent className='p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm font-medium'>
              Device Status
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                isActive
                  ? 'bg-green-500/10'
                  : station.status === 'maintenance'
                    ? 'bg-yellow-500/10'
                    : 'bg-red-500/10'
              }`}
            >
              <CheckCircle2
                className={`h-4 w-4 ${
                  isActive
                    ? 'text-green-600 dark:text-green-400'
                    : station.status === 'maintenance'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                }`}
              />
            </div>
          </div>
          <div className='text-foreground text-xl font-bold capitalize'>
            {statusText}
          </div>
          <div className='mt-1 text-xs text-green-600 dark:text-green-400'>
            {isActive
              ? 'Uptime: 99.8%'
              : stationStatus?.offlineDurationMinutes
                ? `Offline for ${Math.floor(stationStatus.offlineDurationMinutes / 60)}h ${stationStatus.offlineDurationMinutes % 60}m`
                : `Status: ${station.status}`}
          </div>
        </CardContent>
      </Card>

      {/* Card 2 – Alert Threshold */}
      <Card className='border-border bg-card'>
        <CardContent className='p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm font-medium'>
              Alert Threshold
            </span>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10'>
              <Info className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            </div>
          </div>
          <div className='text-foreground text-xl font-bold'>
            {station.thresholdCritical != null
              ? `${station.thresholdCritical}m`
              : '-'}
          </div>
          <div className='text-muted-foreground mt-1 text-xs'>
            Warning:{' '}
            {station.thresholdWarning != null
              ? `${station.thresholdWarning}m`
              : '-'}
          </div>
        </CardContent>
      </Card>

      {/* Card 3 – Calibration */}
      <Card className='border-border bg-card'>
        <CardContent className='p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm font-medium'>
              Calibration
            </span>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10'>
              <Settings2 className='h-4 w-4 text-orange-600 dark:text-orange-400' />
            </div>
          </div>
          <div className='text-foreground text-xl font-bold'>
            {station.calibrationOffset != null
              ? `±${Math.abs(station.calibrationOffset)} cm`
              : '-'}
          </div>
          <div className='text-muted-foreground mt-1 text-xs'>
            Updated:{' '}
            {station.updatedAt
              ? new Date(station.updatedAt).toLocaleDateString()
              : '-'}
          </div>
        </CardContent>
      </Card>

      {/* Card 4 – Current Incidents */}
      <Card className='border-border bg-card'>
        <CardContent className='p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm font-medium'>
              Current Incidents
            </span>
            <div className='bg-muted flex h-8 w-8 items-center justify-center rounded-full'>
              <AlertTriangle className='text-muted-foreground h-4 w-4' />
            </div>
          </div>
          <div className='text-muted-foreground text-xl font-bold italic'>
            None
          </div>
          <div className='text-muted-foreground mt-1 text-xs'>
            System stable
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
