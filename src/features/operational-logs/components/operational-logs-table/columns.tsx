import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import type { OperationalLogListItem } from '../../types';
import { normalizeDetailsText } from '../../utils/format-details';
import { levelBadgeClass, levelLabelVi } from '../../utils/level-ui';

const CATEGORY_OPTIONS_ALL = [
  { label: 'Hệ thống', value: 'system' },
  { label: 'Cảnh báo', value: 'alert' },
  { label: 'Cảm biến', value: 'sensor' },
  { label: 'Điều phối', value: 'moderation' }
];

const LEVEL_OPTIONS = [
  { label: 'Thông tin', value: 'info' },
  { label: 'Cảnh báo', value: 'warning' },
  { label: 'Lỗi', value: 'error' }
];

export function getOperationalLogsColumns(args: {
  isAuthority?: boolean;
}): ColumnDef<OperationalLogListItem>[] {
  const categoryOptions = args.isAuthority
    ? CATEGORY_OPTIONS_ALL.filter(
        (x) => x.value !== 'system' && x.value !== 'moderation'
      )
    : CATEGORY_OPTIONS_ALL;

  return [
    // --- filter-only columns (render in toolbar, not in table) ---
    {
      id: 'searchText',
      accessorFn: () => '',
      header: () => null,
      cell: () => null,
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: true,
      meta: {
        label: 'Tìm kiếm',
        placeholder: 'Tìm trong chi tiết/lỗi...',
        variant: 'text'
      }
    },
    {
      id: 'createdAtRange',
      accessorFn: () => '',
      header: () => null,
      cell: () => null,
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: true,
      meta: {
        label: 'Thời điểm',
        variant: 'dateRange'
      }
    },

    // --- visible columns ---
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Thời điểm' />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm'>
          {new Date(row.original.createdAt).toLocaleString('vi-VN')}
        </span>
      ),
      enableSorting: true,
      enableColumnFilter: false,
      meta: {
        viewLabel: 'Thời điểm'
      }
    },
    {
      id: 'level',
      accessorKey: 'level',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Mức độ' />
      ),
      cell: ({ row }) => (
        <Badge
          variant='outline'
          className={`w-fit gap-1.5 border ${levelBadgeClass(row.original.level)}`}
        >
          {levelLabelVi(row.original.level)}
        </Badge>
      ),
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        viewLabel: 'Mức độ',
        label: 'Mức độ',
        variant: 'select',
        options: LEVEL_OPTIONS
      }
    },
    {
      id: 'category',
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nhóm' />
      ),
      cell: ({ row }) => (
        <span className='font-medium'>
          {String(row.original.category ?? '—')}
        </span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        viewLabel: 'Nhóm',
        label: 'Nhóm',
        variant: 'select',
        options: categoryOptions
      }
    },
    {
      id: 'action',
      accessorKey: 'action',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Sự kiện' />
      ),
      cell: ({ row }) => (
        <span className='font-medium'>{row.original.action}</span>
      ),
      enableSorting: true,
      enableColumnFilter: false,
      meta: {
        viewLabel: 'Sự kiện'
      }
    },
    {
      id: 'user',
      accessorFn: (row) => row.userName ?? row.userId ?? '',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Người dùng' />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm'>
          {row.original.userName ?? row.original.userId ?? '—'}
        </span>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        viewLabel: 'Người dùng'
      }
    },
    {
      id: 'entityType',
      accessorKey: 'entityType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Đối tượng' />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm'>
          {row.original.entityType ?? '—'}
        </span>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        viewLabel: 'Đối tượng'
      }
    },
    {
      id: 'error',
      accessorFn: (row) => (row.errorMessage ? '1' : ''),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Lỗi' />
      ),
      cell: ({ row }) =>
        row.original.errorMessage ? (
          <span className='text-sm font-medium text-red-700'>Có</span>
        ) : (
          <span className='text-muted-foreground text-sm'>—</span>
        ),
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        viewLabel: 'Lỗi'
      }
    },
    {
      id: 'details',
      accessorFn: (row) => normalizeDetailsText(row.details),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Chi tiết' />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground line-clamp-1 max-w-[420px] text-sm'>
          {normalizeDetailsText(row.original.details) || '—'}
        </span>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        viewLabel: 'Chi tiết'
      }
    }
  ];
}
