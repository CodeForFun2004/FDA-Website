'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { AdministrativeArea } from '@/features/admin/types/admin.type';
import { AdminAreaCellAction } from './admin-area-cell-action';

export const adminAreasColumns: ColumnDef<AdministrativeArea>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <div className='min-w-[220px] font-medium'>{row.original.name}</div>
    ),
    enableColumnFilter: true,
    meta: { variant: 'text', label: 'Name', placeholder: 'Search name…' }
  },
  {
    accessorKey: 'level',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Level' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground'>{row.original.level}</div>
    ),
    enableColumnFilter: true,
    meta: {
      variant: 'select',
      label: 'Level',
      options: [
        { label: 'Province', value: 'province' },
        { label: 'District', value: 'district' },
        { label: 'Ward', value: 'ward' },
        { label: 'Street', value: 'street' }
      ]
    }
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Code' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground min-w-[140px] font-mono text-xs'>
        {row.original.code || '—'}
      </div>
    ),
    enableColumnFilter: true,
    meta: { variant: 'text', label: 'Code', placeholder: 'Search code…' }
  },
  {
    accessorKey: 'parentId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Parent ID' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground min-w-[160px] truncate font-mono text-xs'>
        {row.original.parentId ?? '—'}
      </div>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => <AdminAreaCellAction area={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
];
