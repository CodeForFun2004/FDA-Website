'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { FloodEvent } from '@/features/admin/types/admin.type';
import { FloodEventCellAction } from './flood-event-cell-action';

function dt(iso: string) {
  try {
    return new Date(iso).toLocaleString('vi-VN');
  } catch {
    return iso;
  }
}

export const floodEventsColumns: ColumnDef<FloodEvent>[] = [
  {
    accessorKey: 'administrativeAreaName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Khu vực' />
    ),
    cell: ({ row }) => (
      <div className='min-w-[220px] truncate font-medium'>
        {row.original.administrativeAreaName ??
          row.original.administrativeAreaId}
      </div>
    ),
    enableColumnFilter: true,
    meta: { variant: 'text', label: 'Khu vực', placeholder: 'Tìm khu vực…' }
  },
  {
    accessorKey: 'startTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bắt đầu' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground min-w-[180px]'>
        {dt(row.original.startTime)}
      </div>
    ),
    enableColumnFilter: true,
    meta: { variant: 'text', label: 'Bắt đầu', placeholder: 'YYYY-MM-DD…' }
  },
  {
    accessorKey: 'endTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Kết thúc' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground min-w-[180px]'>
        {dt(row.original.endTime)}
      </div>
    )
  },
  {
    accessorKey: 'peakLevel',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Đỉnh (m)' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground text-right font-mono text-xs'>
        {row.original.peakLevel != null ? row.original.peakLevel : '—'}
      </div>
    )
  },
  {
    accessorKey: 'durationHours',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Thời lượng (giờ)' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground text-right font-mono text-xs'>
        {row.original.durationHours != null ? row.original.durationHours : '—'}
      </div>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => <FloodEventCellAction event={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
];
