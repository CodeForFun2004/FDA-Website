'use client';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Area } from '../../types/area.type';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { MapPin, Radius } from 'lucide-react';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Area>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Area, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => (
      <div className='min-w-[200px] font-medium'>{String(cell.getValue())}</div>
    ),
    meta: {
      label: 'Name',
      placeholder: 'Search areas...',
      variant: 'text'
    },
    enableColumnFilter: true
  },
  {
    id: 'addressText',
    accessorKey: 'addressText',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Address' />
    ),
    cell: ({ cell }) => (
      <div className='min-w-[240px]'>{String(cell.getValue())}</div>
    )
  },
  {
    id: 'latitude',
    accessorKey: 'latitude',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Lat' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<number>().toFixed(6)}</div>
  },
  {
    id: 'longitude',
    accessorKey: 'longitude',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Lng' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<number>().toFixed(6)}</div>
  },
  {
    id: 'radiusMeters',
    accessorKey: 'radiusMeters',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Radius (m)' />
    ),
    cell: ({ cell }) => (
      <div className='flex items-center gap-1'>
        <Radius className='text-muted-foreground h-3.5 w-3.5' />
        {cell.getValue<number>()}
      </div>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
