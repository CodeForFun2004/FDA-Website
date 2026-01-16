'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Station } from '@/features/stations/types/station.type';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Text, Wrench, XCircle } from 'lucide-react';
import { CellAction } from './cell-action';

// options cho filter giống product
export const STATION_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Maintenance', value: 'maintenance' }
];

export const columns: ColumnDef<Station>[] = [
  {
    id: 'code',
    accessorKey: 'code',
    header: ({ column }: { column: Column<Station, unknown> }) => (
      <DataTableColumnHeader column={column} title='Code' />
    ),
    cell: ({ cell }) => (
      <div className='font-medium'>{String(cell.getValue())}</div>
    ),
    // meta: {
    //   label: 'Code',
    //   placeholder: 'Search stations...',
    //   variant: 'text',
    //   icon: Text
    // },
    enableColumnFilter: true
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Station, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => (
      <div className='min-w-[220px]'>{String(cell.getValue())}</div>
    ),
    meta: {
      label: 'Name',
      placeholder: "Search station's name ...",
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'roadName',
    accessorKey: 'roadName',
    header: ({ column }: { column: Column<Station, unknown> }) => (
      <DataTableColumnHeader column={column} title='Road' />
    ),
    cell: ({ cell }) => (
      <div className='min-w-[180px]'>{String(cell.getValue() ?? '-')}</div>
    )
  },
  {
    id: 'direction',
    accessorKey: 'direction',
    header: ({ column }: { column: Column<Station, unknown> }) => (
      <DataTableColumnHeader column={column} title='Direction' />
    ),
    cell: ({ cell }) => (
      <div className='min-w-[120px]'>{String(cell.getValue() ?? '-')}</div>
    )
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<Station, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const status = String(cell.getValue() ?? '').toLowerCase();
      const Icon =
        status === 'active'
          ? CheckCircle2
          : status === 'maintenance'
            ? Wrench
            : XCircle;

      return (
        <Badge variant='outline' className='gap-1 capitalize'>
          <Icon className='h-4 w-4' />
          {status || 'unknown'}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'status',
      variant: 'multiSelect',
      options: STATION_STATUS_OPTIONS
    }
  },
  {
    id: 'thresholdWarning',
    accessorKey: 'thresholdWarning',
    header: ({ column }: { column: Column<Station, unknown> }) => (
      <DataTableColumnHeader column={column} title='Warn' />
    ),
    cell: ({ row }) => {
      const v = row.original.thresholdWarning;
      return <div>{v == null ? '-' : v}</div>;
    }
  },
  {
    id: 'thresholdCritical',
    accessorKey: 'thresholdCritical',
    header: ({ column }: { column: Column<Station, unknown> }) => (
      <DataTableColumnHeader column={column} title='Critical' />
    ),
    cell: ({ row }) => {
      const v = row.original.thresholdCritical;
      return <div>{v == null ? '-' : v}</div>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
