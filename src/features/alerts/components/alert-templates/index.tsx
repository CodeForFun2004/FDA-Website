'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Button } from '@/components/ui/button';
import { useDataTable } from '@/hooks/use-data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { Plus } from 'lucide-react';

interface AlertTemplatesTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
  onOpenCreate: () => void;
}

export function AlertTemplatesTable<TData, TValue>({
  data,
  totalItems,
  columns,
  onOpenCreate
}: AlertTemplatesTableParams<TData, TValue>) {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const pageCount = Math.ceil(totalItems / pageSize);

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    shallow: false,
    debounceMs: 500
  });

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <Button onClick={onOpenCreate} className='gap-2' size='sm'>
            <Plus className='h-4 w-4' />
            Create Template
          </Button>
        </DataTableToolbar>
      </DataTable>
    </>
  );
}
