'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type {
  Station,
  GetStationStatusResponse
} from '@/features/stations/types/station.type';
import { CheckCircle2, Info, Settings2, Wifi, RefreshCw } from 'lucide-react';

function formatLastSeenShort(lastSeenAt: string | null): string {
  if (!lastSeenAt) return '—';
  const date = new Date(lastSeenAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'Just now';
}

function connectionSummary(
  station: Station,
  stationStatus?: GetStationStatusResponse | null
) {
  const isActive =
    station.status === 'online' || (station.status as string) === 'active';
  const batteryLevel = stationStatus?.batteryLevel ?? (isActive ? 85 : 0);
  const rssi = stationStatus?.signalStrength ?? (isActive ? -45 : 0);
  let signalBars = 0;
  if (rssi !== 0 && rssi !== null) {
    if (rssi >= -60) signalBars = 4;
    else if (rssi >= -80) signalBars = 3;
    else if (rssi >= -100) signalBars = 2;
    else signalBars = 1;
  }
  const signalLabel =
    signalBars >= 3
      ? 'Good'
      : signalBars >= 2
        ? 'Fair'
        : signalBars >= 1
          ? 'Weak'
          : 'None';
  return { batteryLevel, rssi, signalLabel };
}

interface StationSummaryCardsProps {
  station: Station;
  stationStatus?: GetStationStatusResponse | null;
  onRefreshStatus?: () => void;
}

export function StationSummaryCards({
  station,
  stationStatus,
  onRefreshStatus
}: StationSummaryCardsProps) {
  const isActive =
    station.status === 'online' || (station.status as string) === 'active';
  const statusText = isActive
    ? 'Online'
    : station.status === 'maintenance'
      ? 'Maintenance'
      : 'Offline';

  const { batteryLevel, rssi, signalLabel } = connectionSummary(
    station,
    stationStatus
  );

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

      {/* Card 4 – Connection Status */}
      <Card className='border-border bg-card'>
        <CardContent className='p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm font-medium'>
              Connection Status
            </span>
            <div className='flex items-center gap-1'>
              {onRefreshStatus ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='text-muted-foreground h-8 w-8'
                  onClick={() => onRefreshStatus()}
                  aria-label='Refresh connection status'
                >
                  <RefreshCw className='h-3.5 w-3.5' />
                </Button>
              ) : null}
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10'>
                <Wifi className='h-4 w-4 text-sky-600 dark:text-sky-400' />
              </div>
            </div>
          </div>
          <div className='text-foreground text-xl font-bold'>
            {batteryLevel}%
          </div>
          <div className='text-muted-foreground mt-1 text-xs'>
            Battery · Signal {signalLabel}
            {rssi !== 0 && rssi !== null ? ` (${rssi} dBm)` : ''}
          </div>
          <div className='text-muted-foreground mt-1 text-xs'>
            Last sync: {formatLastSeenShort(station.lastSeenAt)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
