'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Button } from '@/components/ui/button';
import { CreateStationDialog } from '@/features/stations/components/CreateStationDialog';

import { useDataTable } from '@/hooks/use-data-table';

import type { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface StationTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
}

export function StationTable<TData, TValue>({
  data,
  totalItems,
  columns
}: StationTableParams<TData, TValue>) {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [openCreate, setOpenCreate] = useState(false);
  const router = useRouter();
  const pageCount = Math.ceil(totalItems / pageSize);

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    shallow: false, // triggers network request with updated querystring
    debounceMs: 500
  });

  console.log(
    '[StationTable] data length',
    data?.length,
    'totalItems',
    totalItems
  );

  return (
    <>
      <CreateStationDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <Button
            onClick={() => setOpenCreate(true)}
            className='gap-2'
            size='sm'
          >
            <Plus className='h-4 w-4' />
            Add Station
          </Button>
        </DataTableToolbar>
      </DataTable>
    </>
  );
}
