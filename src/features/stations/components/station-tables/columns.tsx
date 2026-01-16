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

      // Determine badge variant and styling based on status
      const getBadgeConfig = (status: string) => {
        switch (status) {
          case 'active':
            return {
              variant: 'default' as const,
              className:
                'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 hover:bg-green-500/20',
              icon: CheckCircle2,
              iconClassName: 'text-green-600 dark:text-green-400'
            };
          case 'maintenance':
            return {
              variant: 'default' as const,
              className:
                'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20',
              icon: Wrench,
              iconClassName: 'text-yellow-600 dark:text-yellow-400'
            };
          case 'inactive':
            return {
              variant: 'default' as const,
              className:
                'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 hover:bg-red-500/20',
              icon: XCircle,
              iconClassName: 'text-red-600 dark:text-red-400'
            };
          default:
            return {
              variant: 'outline' as const,
              className: '',
              icon: XCircle,
              iconClassName: ''
            };
        }
      };

      const config = getBadgeConfig(status);
      const Icon = config.icon;

      return (
        <Badge
          variant={config.variant}
          className={`gap-1.5 font-medium capitalize ${config.className}`}
        >
          <Icon className={`h-3.5 w-3.5 ${config.iconClassName}`} />
          {status || 'unknown'}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Status',
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
