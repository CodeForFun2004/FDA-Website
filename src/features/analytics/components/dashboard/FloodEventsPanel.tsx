'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getFloodEventsApi } from '@/features/admin/api/admin.api';
import type { AdministrativeArea } from '@/features/analytics/types/analytics.types';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { floodEventsColumns } from '@/features/analytics/components/dashboard/tables/flood-events-columns';
import { FloodEventDialog } from '@/features/analytics/components/dashboard/dialogs/FloodEventDialog';
import type { FloodEvent } from '@/features/admin/types/admin.type';
import { IconPlus } from '@tabler/icons-react';
import { useSearchParams } from 'next/navigation';

function toInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function FloodEventsPanel(props: { areas: AdministrativeArea[] }) {
  const [openCreate, setOpenCreate] = useState(false);

  const sp = useSearchParams();
  const page = toInt(sp.get('page'), 1);
  const perPage = toInt(sp.get('perPage'), 10);
  const area = sp.get('administrativeAreaName') ?? '';
  const start = sp.get('startTime') ?? '';

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-flood-events', page, perPage, area, start],
    queryFn: () =>
      getFloodEventsApi({
        pageNumber: page,
        pageSize: perPage,
        searchTerm: (area || start).trim() || undefined
      }),
    retry: false
  });

  const rows: FloodEvent[] = data?.floodEvents ?? [];
  const totalCount = data?.totalCount ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / perPage));

  const enriched = React.useMemo(() => {
    if (!rows.length) return rows;
    const areaMap = new Map(props.areas.map((a) => [a.id, a]));
    return rows.map((e) => ({
      ...e,
      administrativeAreaName:
        e.administrativeAreaName ??
        areaMap.get(e.administrativeAreaId)?.name ??
        null
    }));
  }, [rows, props.areas]);

  const { table } = useDataTable({
    data: enriched,
    columns: floodEventsColumns,
    pageCount,
    debounceMs: 300,
    shallow: false
  });

  return (
    <>
      <FloodEventDialog open={openCreate} onOpenChange={setOpenCreate} />

      <Card className='border-border shadow-none'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-sm'>Flood events</CardTitle>
            <Button
              size='sm'
              className='h-8 gap-1.5 text-xs'
              onClick={() => setOpenCreate(true)}
            >
              <IconPlus className='h-3.5 w-3.5' />
              Create event
            </Button>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {isLoading ? (
            <div className='text-muted-foreground rounded-lg border p-8 text-center text-sm'>
              Loading…
            </div>
          ) : isError ? (
            <div className='text-muted-foreground rounded-lg border p-8 text-center text-sm'>
              Failed to load flood events.{' '}
              <button
                className='text-primary underline'
                onClick={() => void refetch()}
              >
                Retry
              </button>
            </div>
          ) : (
            <DataTable table={table}>
              <DataTableToolbar table={table} />
            </DataTable>
          )}

          <div className='text-muted-foreground text-xs leading-relaxed'>
            Flood events được dùng để tính{' '}
            <span className='font-medium'>eventCount</span> trong Frequency
            aggregation. Nếu thêm/sửa/xóa flood events, nên re-run Frequency
            aggregation để analytics phản ánh đúng.
          </div>
        </CardContent>
      </Card>
    </>
  );
}
