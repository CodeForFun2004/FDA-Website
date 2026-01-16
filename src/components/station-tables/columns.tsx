// src/components/station-tables/columns.tsx
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Station } from '@/features/stations/types/station.type';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

function StatusBadge({ status }: { status: Station['status'] }) {
  const v = String(status ?? '').toUpperCase();
  return <Badge variant='secondary'>{v || 'UNKNOWN'}</Badge>;
}

export const columns: ColumnDef<Station>[] = [
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <Button
        variant='ghost'
        className='px-0'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Code
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    )
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant='ghost'
        className='px-0'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Name
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => (
      <div className='min-w-[220px] font-medium'>{row.getValue('name')}</div>
    )
  },
  {
    accessorKey: 'roadName',
    header: 'Road',
    cell: ({ row }) => (
      <div className='min-w-[180px]'>
        {(row.getValue('roadName') as string) || '-'}
      </div>
    )
  },
  {
    accessorKey: 'direction',
    header: 'Direction',
    cell: ({ row }) => (
      <div className='min-w-[120px]'>
        {(row.getValue('direction') as string) || '-'}
      </div>
    )
  },
  {
    accessorKey: 'thresholdWarning',
    header: 'Warn',
    cell: ({ row }) => {
      const v = row.getValue('thresholdWarning') as number | null;
      return <div>{v === null ? '-' : v}</div>;
    }
  },
  {
    accessorKey: 'thresholdCritical',
    header: 'Critical',
    cell: ({ row }) => {
      const v = row.getValue('thresholdCritical') as number | null;
      return <div>{v === null ? '-' : v}</div>;
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row, table }) => {
      const station = row.original;
      const meta = table.options.meta as
        | { onEdit?: (s: Station) => void; onDelete?: (s: Station) => void }
        | undefined;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(String(station.id))}
            >
              Copy ID
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => meta?.onEdit?.(station)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className='text-destructive focus:text-destructive'
              onClick={() => meta?.onDelete?.(station)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
