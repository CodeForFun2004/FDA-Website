'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type {
  Station,
  GetStationStatusResponse
} from '@/features/stations/types/station.type';
import { RefreshCw } from 'lucide-react';

interface StationConnectionStatusProps {
  station: Station;
  stationStatus?: GetStationStatusResponse | null;
  onRefresh?: () => void;
}

function formatLastSeen(lastSeenAt: string | null): string {
  if (!lastSeenAt) return '-';
  const date = new Date(lastSeenAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} days ago`;
  if (diffHours > 0) return `${diffHours} hours ago`;
  if (diffMins > 0) return `${diffMins} min ago`;
  return 'Just now';
}

export function StationConnectionStatus({
  station,
  stationStatus,
  onRefresh
}: StationConnectionStatusProps) {
  const isActive =
    station.status === 'online' || (station.status as string) === 'active';

  // Use data from API, otherwise fallback to mock values
  const batteryLevel = stationStatus?.batteryLevel ?? (isActive ? 85 : 0);

  // Signal strength usually maps negative dBm to bars.
  // -50 or greater is excellent (4 bars)
  // -60 to -70 is good (3 bars)
  // -80 to -90 is fair (2 bars)
  // -100 or less is weak (1 bar)
  // 0 means no signal
  const rssi = stationStatus?.signalStrength ?? (isActive ? -45 : 0);
  let signalBars = 0;
  if (rssi !== 0 && rssi !== null) {
    if (rssi >= -60) signalBars = 4;
    else if (rssi >= -80) signalBars = 3;
    else if (rssi >= -100) signalBars = 2;
    else signalBars = 1;
  }

  const maxBars = 4;

  return (
    <Card className='border-border bg-card'>
      <CardHeader className='px-5 pt-5 pb-0'>
        <CardTitle className='text-foreground text-sm font-semibold'>
          Trạng thái kết nối
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 p-5'>
        {/* Battery */}
        <div>
          <div className='mb-1 flex justify-between text-sm'>
            <span className='text-muted-foreground'>Pin</span>
            <span className='text-foreground font-semibold'>
              {batteryLevel}%
            </span>
          </div>
          <div className='bg-muted h-2 w-full rounded-full'>
            <div
              className={`h-2 rounded-full transition-all ${
                batteryLevel > 70
                  ? 'bg-green-500'
                  : batteryLevel > 30
                    ? 'bg-yellow-400'
                    : 'bg-amber-400'
              }`}
              style={{ width: `${batteryLevel}%` }}
            />
          </div>
        </div>

        {/* Signal */}
        <div>
          <div className='mb-1 flex justify-between text-sm'>
            <span className='text-muted-foreground'>Tín hiệu</span>
            <span className='text-foreground font-semibold'>
              {rssi !== 0 ? `${rssi} dBm` : 'Không có tín hiệu'}
            </span>
          </div>
          <div className='flex items-center gap-1'>
            {Array.from({ length: maxBars }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-sm ${
                  i < signalBars
                    ? 'bg-blue-600 dark:bg-blue-400'
                    : 'bg-muted-foreground/20'
                }`}
                style={{ height: `${((i + 1) / maxBars) * 16 + 4}px` }}
              />
            ))}
            <span className='ml-2 text-xs font-medium text-blue-600 dark:text-blue-400'>
              {signalBars >= 3
                ? 'Good'
                : signalBars >= 2
                  ? 'Fair'
                  : signalBars >= 1
                    ? 'Weak'
                    : 'None'}
            </span>
          </div>
        </div>

        <div className='border-border flex items-center justify-between border-t pt-3 text-xs'>
          <span className='text-muted-foreground italic'>
            Last sync: {formatLastSeen(station.lastSeenAt)}
          </span>
          <Button
            variant='ghost'
            size='sm'
            className='text-primary h-auto p-0 text-xs font-medium'
            onClick={onRefresh}
          >
            <RefreshCw className='mr-1 h-3 w-3' />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
