'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Button } from '@/components/ui/button';
import { CreateUserDialog } from '@/features/users/components/create-user-dialog';
import { useDataTable } from '@/hooks/use-data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface UserTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
}

export function UserTable<TData, TValue>({
  data,
  totalItems,
  columns
}: UserTableParams<TData, TValue>) {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [openCreate, setOpenCreate] = useState(false);
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
      <CreateUserDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onSuccess={() => {
          // React Query handles cache invalidation
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
            Add User
          </Button>
        </DataTableToolbar>
      </DataTable>
    </>
  );
}
