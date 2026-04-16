'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import type { OperationalLogListItem } from '../../types';
import type { Table as TanstackTable } from '@tanstack/react-table';

export type OperationalLogsTableProps = {
  table: TanstackTable<OperationalLogListItem>;
  onOpenDetail: (id: string) => void;
  loading?: boolean;
};

export function OperationalLogsTable({
  table,
  onOpenDetail,
  loading
}: OperationalLogsTableProps) {
  if (loading) {
    return (
      <DataTableSkeleton
        columnCount={8}
        rowCount={10}
        filterCount={4}
        withViewOptions
        withPagination
      />
    );
  }

  return (
    <DataTable
      table={table}
      onRowClick={(row) => {
        onOpenDetail(row.original.id);
      }}
    >
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
