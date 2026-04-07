'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAdministrativeAreasApi } from '@/features/admin/api/admin.api';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { adminAreasColumns } from '@/features/analytics/components/dashboard/tables/admin-areas-columns';
import { AdminAreaDialog } from '@/features/analytics/components/dashboard/dialogs/AdminAreaDialog';
import type { AdministrativeArea } from '@/features/admin/types/admin.type';
import { IconPlus } from '@tabler/icons-react';
import { useSearchParams } from 'next/navigation';

function toInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function AdminAreasPanel() {
  const [openCreate, setOpenCreate] = useState(false);

  const sp = useSearchParams();
  const page = toInt(sp.get('page'), 1);
  const perPage = toInt(sp.get('perPage'), 10);
  const name = sp.get('name') ?? '';
  const code = sp.get('code') ?? '';
  const level = sp.get('level') ?? '';

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-areas', page, perPage, name, code, level],
    queryFn: () =>
      getAdministrativeAreasApi({
        pageNumber: page,
        pageSize: perPage,
        searchTerm: (name || code).trim() || undefined,
        level: level || undefined
      }),
    retry: false
  });

  const rows: AdministrativeArea[] = data?.administrativeAreas ?? [];
  const totalCount = data?.totalCount ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / perPage));

  const { table } = useDataTable({
    data: rows,
    columns: adminAreasColumns,
    pageCount,
    debounceMs: 300,
    shallow: false
  });

  return (
    <>
      <AdminAreaDialog open={openCreate} onOpenChange={setOpenCreate} />

      <Card className='border-border shadow-none'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-sm'>Administrative areas</CardTitle>
            <Button
              size='sm'
              className='h-8 gap-1.5 text-xs'
              onClick={() => setOpenCreate(true)}
            >
              <IconPlus className='h-3.5 w-3.5' />
              Create area
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
              Failed to load administrative areas.{' '}
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
            Areas là dimension chính cho aggregation (group theo
            AdministrativeAreaId). Khi chỉnh sửa areas, thường cần re-run
            aggregation để đồng bộ analytics tables/cache.
          </div>
        </CardContent>
      </Card>
    </>
  );
}
