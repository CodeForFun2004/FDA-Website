'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Station } from '@/features/stations/types/station.type';
import { useStationRealtimeFromMap } from '@/features/stations/hooks/useStationRealtimeFromMap';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Waves, Clock, Radio } from 'lucide-react';
import { t } from '@/locales/t';

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('vi-VN');
  } catch {
    return iso;
  }
}

function stationStatusLabel(raw: unknown) {
  const s = String(raw ?? '').trim();
  if (!s) return '—';
  switch (s.toLowerCase()) {
    case 'maintenance':
      return 'Maintenance';
    case 'unknown':
      return 'Unknown';
    case 'online':
      return 'Online';
    case 'offline':
      return 'Offline';
    default:
      return s;
  }
}

function severityBadge(severity: string | null | undefined) {
  const s = String(severity ?? '').toLowerCase();
  if (s === 'critical')
    return (
      <Badge className='border border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400'>
        Critical
      </Badge>
    );
  if (s === 'warning')
    return (
      <Badge className='border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'>
        Warning
      </Badge>
    );
  if (s === 'alarm')
    return (
      <Badge className='border border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300'>
        Alarm
      </Badge>
    );
  if (s === 'safe')
    return (
      <Badge className='border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'>
        Safe
      </Badge>
    );
  if (!s)
    return (
      <Badge variant='outline' className='text-muted-foreground'>
        —
      </Badge>
    );
  return <Badge variant='outline'>{severity}</Badge>;
}

export function StationRealtimeStatus({ station }: { station: Station }) {
  const { properties, isLoading, error, refreshedAt, refresh } =
    useStationRealtimeFromMap({
      station,
      enabled: true,
      zoom: 14,
      radiusKm: 2,
      pollMs: 15000
    });

  const hasData = !!properties;

  return (
    <Card className='border-border bg-card'>
      <CardHeader className='border-border flex flex-row items-center justify-between border-b px-4 py-3'>
        <div className='min-w-0'>
          <CardTitle className='text-foreground text-sm font-semibold'>
            Trạng thái realtime
          </CardTitle>
          <p className='text-muted-foreground mt-0.5 text-xs'>
            Dữ liệu realtime lấy từ bản đồ (map/current-status).
          </p>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='text-primary h-8 gap-2'
          onClick={refresh}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
          />
          {t('common.refresh')}
        </Button>
      </CardHeader>

      <CardContent className='p-4 sm:p-5'>
        {error ? (
          <div className='border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm'>
            {error}
          </div>
        ) : null}

        {!hasData && !isLoading ? (
          <div className='text-muted-foreground rounded-lg border border-dashed p-4 text-sm'>
            Chưa có dữ liệu realtime cho trạm này.
          </div>
        ) : null}

        {hasData ? (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='min-w-0 rounded-lg border p-4 sm:p-5'>
              <div className='text-muted-foreground mb-1 flex items-center gap-2 text-[11px] font-medium'>
                <Waves className='h-3.5 w-3.5' />
                Mực nước
              </div>
              <div className='text-foreground text-xl leading-none font-bold tabular-nums sm:text-2xl'>
                {properties?.waterLevel != null ? properties.waterLevel : '—'}
              </div>
              <div className='text-muted-foreground mt-1 text-[10px] font-semibold sm:text-xs'>
                {properties?.unit ?? '—'}
              </div>
              <div className='text-muted-foreground mt-2 text-[11px]'>
                measuredAt: {formatDateTime(properties?.measuredAt)}
              </div>
            </div>

            <div className='min-w-0 rounded-lg border p-4 sm:p-5'>
              <div className='text-muted-foreground mb-2 flex items-center gap-2 text-[11px] font-medium'>
                <Radio className='h-3.5 w-3.5' />
                {t('station.status')}
              </div>
              <div className='flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2'>
                <Badge
                  variant='outline'
                  className='w-fit max-w-full shrink-0 px-1.5 py-0.5 text-[11px] leading-none whitespace-nowrap sm:px-2 sm:py-1'
                >
                  {stationStatusLabel(properties?.stationStatus)}
                </Badge>
                {severityBadge(properties?.severity)}
              </div>
              <div className='text-muted-foreground mt-2 text-[11px] break-words'>
                alertLevel: {properties?.alertLevel ?? '—'}
              </div>
            </div>

            <div className='min-w-0 rounded-lg border p-4 sm:p-5'>
              <div className='text-muted-foreground mb-2 flex items-center gap-2 text-[11px] font-medium'>
                <Clock className='h-3.5 w-3.5' />
                Đồng bộ
              </div>
              <div className='text-foreground text-[13px] font-semibold'>
                lastSeenAt: {formatDateTime(properties?.lastSeenAt)}
              </div>
              <div className='text-muted-foreground mt-2 text-[11px]'>
                refreshedAt: {formatDateTime(refreshedAt)}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
