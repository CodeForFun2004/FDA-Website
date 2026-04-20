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
      <DataTableColumnHeader column={column} title='Tên' />
    ),
    cell: ({ cell }) => (
      <div className='min-w-[200px] font-medium'>{String(cell.getValue())}</div>
    ),
    meta: {
      label: 'Tên',
      placeholder: 'Tìm theo khu vực…',
      variant: 'text'
    },
    enableColumnFilter: true
  },
  {
    id: 'addressText',
    accessorKey: 'addressText',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Địa chỉ' />
    ),
    cell: ({ cell }) => (
      <div className='min-w-[240px]'>{String(cell.getValue())}</div>
    )
  },
  {
    id: 'latitude',
    accessorKey: 'latitude',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vĩ độ' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<number>().toFixed(6)}</div>
  },
  {
    id: 'longitude',
    accessorKey: 'longitude',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Kinh độ' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<number>().toFixed(6)}</div>
  },
  {
    id: 'radiusMeters',
    accessorKey: 'radiusMeters',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bán kính (m)' />
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
