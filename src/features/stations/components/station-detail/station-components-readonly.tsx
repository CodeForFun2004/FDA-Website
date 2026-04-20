'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Component } from '@/features/stations/types/station.type';
import { stationsApi } from '@/features/stations/api/station.api';
import { getAccessToken } from '@/libs/auth-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cpu, RefreshCw } from 'lucide-react';

function statusBadge(status: string) {
  const s = String(status ?? '').toLowerCase();
  if (s === 'active')
    return (
      <Badge className='border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'>
        Hoạt động
      </Badge>
    );
  if (s === 'faulty')
    return (
      <Badge className='border border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400'>
        Lỗi
      </Badge>
    );
  if (s === 'inactive')
    return (
      <Badge className='border border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-300'>
        Không hoạt động
      </Badge>
    );
  return <Badge variant='outline'>{status}</Badge>;
}

function typeLabel(t: string) {
  const map: Record<string, string> = {
    esp32: 'ESP32 (MCU)',
    srt04: 'Cảm biến siêu âm (SRT04)',
    temperature_sensor: 'Cảm biến nhiệt độ',
    battery: 'Pin',
    speaker: 'Loa',
    gsm_module: 'GSM Module',
    solar_panel: 'Tấm pin năng lượng mặt trời',
    rain_sensor: 'Cảm biến mưa'
  };
  const key = String(t ?? '');
  return map[key] ?? key ?? '—';
}

export function StationComponentsReadonly({
  stationId
}: {
  stationId: string;
}) {
  const [data, setData] = React.useState<Component[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchComponents = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessToken();
      const res = await stationsApi.getComponents(
        stationId,
        token ?? undefined
      );
      setData(res.components ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Không thể tải danh sách thiết bị');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  React.useEffect(() => {
    void fetchComponents();
  }, [fetchComponents]);

  return (
    <Card className='border-border bg-card'>
      <CardHeader className='border-border flex flex-row items-center justify-between border-b px-4 py-3'>
        <div className='min-w-0'>
          <CardTitle className='text-foreground text-sm font-semibold'>
            Thành phần của trạm
          </CardTitle>
          <p className='text-muted-foreground mt-0.5 text-xs'>
            Danh sách thiết bị đang gắn với trạm (read-only).
          </p>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='text-primary h-8 gap-2'
          onClick={fetchComponents}
          disabled={loading}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </CardHeader>

      <CardContent className='p-5'>
        {error ? (
          <div className='border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm'>
            <div className='font-medium'>Không tải được thiết bị</div>
            <div className='mt-1 text-xs'>{error}</div>
          </div>
        ) : null}

        {loading ? (
          <div className='space-y-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='bg-muted h-12 animate-pulse rounded-lg' />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className='text-muted-foreground rounded-lg border border-dashed p-4 text-sm'>
            Trạm chưa có thiết bị nào.
          </div>
        ) : (
          <div className='space-y-3'>
            {data.map((c) => (
              <div
                key={c.id}
                className='flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between'
              >
                <div className='min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='bg-muted flex h-8 w-8 items-center justify-center rounded-lg'>
                      <Cpu className='text-muted-foreground h-4 w-4' />
                    </span>
                    <div className='min-w-0'>
                      <div className='text-foreground line-clamp-1 font-semibold'>
                        {c.name || typeLabel(c.componentType)}
                      </div>
                      <div className='text-muted-foreground line-clamp-1 text-xs'>
                        {typeLabel(c.componentType)}
                        {c.model ? ` • ${c.model}` : ''}
                        {c.serialNumber ? ` • SN: ${c.serialNumber}` : ''}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='flex items-center justify-between gap-3 md:justify-end'>
                  {statusBadge(c.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
