'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { AlertTemplate } from '@/features/alerts/types/alert-template.type';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { Text, CheckSquare2, Square } from 'lucide-react';
import { CellAction } from '@/features/alerts/components/alert-templates/cell-action';
import { formatDate } from '@/libs/utils';

export const ALERT_TEMPLATE_SEVERITY_OPTIONS = [
  { label: 'Nghiêm trọng', value: 'critical' },
  { label: 'Cảnh báo', value: 'warning' },
  { label: 'Cảnh giác', value: 'caution' },
  { label: 'Thông tin', value: 'info' }
];

export const ALERT_TEMPLATE_CHANNEL_OPTIONS = [
  { label: 'Thông báo đẩy', value: 'Push' },
  { label: 'Email', value: 'Email' },
  { label: 'SMS', value: 'SMS' },
  { label: 'Trong ứng dụng', value: 'InApp' }
];

export const columns: ColumnDef<AlertTemplate>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<AlertTemplate, unknown> }) => (
      <DataTableColumnHeader column={column} title='Tên' />
    ),
    cell: ({ cell }) => (
      <div className='min-w-[200px] font-medium'>{String(cell.getValue())}</div>
    ),
    meta: {
      label: 'Tên',
      viewLabel: 'Tên',
      placeholder: 'Tìm theo mẫu…',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'channel',
    accessorKey: 'channel',
    header: ({ column }: { column: Column<AlertTemplate, unknown> }) => (
      <DataTableColumnHeader column={column} title='Kênh' />
    ),
    cell: ({ cell }) => (
      <Badge variant='outline'>{String(cell.getValue())}</Badge>
    ),
    enableColumnFilter: true,
    meta: {
      label: 'Kênh',
      viewLabel: 'Kênh',
      variant: 'multiSelect',
      options: ALERT_TEMPLATE_CHANNEL_OPTIONS
    }
  },
  {
    id: 'severity',
    accessorKey: 'severity',
    header: ({ column }: { column: Column<AlertTemplate, unknown> }) => (
      <DataTableColumnHeader column={column} title='Mức cảnh báo' />
    ),
    cell: ({ cell }) => {
      const severity = String(cell.getValue() ?? '');
      if (!severity || severity === 'null')
        return <span className='text-gray-400'>Tất cả</span>;
      const labels: Record<string, string> = {
        critical: 'Nghiêm trọng',
        warning: 'Cảnh báo',
        caution: 'Cảnh giác',
        info: 'Thông tin'
      };
      const variants: Record<string, string> = {
        critical: 'bg-red-100 text-red-700 border-red-200',
        warning: 'bg-orange-100 text-orange-700 border-orange-200',
        caution: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        info: 'bg-blue-100 text-blue-700 border-blue-200'
      };
      return (
        <Badge variant='outline' className={variants[severity] || ''}>
          {labels[severity] ?? severity}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Mức cảnh báo',
      viewLabel: 'Mức cảnh báo',
      variant: 'multiSelect',
      options: ALERT_TEMPLATE_SEVERITY_OPTIONS
    }
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: ({ column }: { column: Column<AlertTemplate, unknown> }) => (
      <DataTableColumnHeader column={column} title='Kích hoạt' />
    ),
    cell: ({ cell }) =>
      cell.getValue() ? (
        <CheckSquare2 className='h-5 w-5 text-emerald-500' />
      ) : (
        <Square className='h-5 w-5 text-gray-400' />
      ),
    meta: { viewLabel: 'Kích hoạt' }
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }: { column: Column<AlertTemplate, unknown> }) => (
      <DataTableColumnHeader column={column} title='Tạo lúc' />
    ),
    cell: ({ cell }) => {
      const val = cell.getValue();
      return <div>{val ? formatDate(String(val)) : '-'}</div>;
    },
    meta: { viewLabel: 'Tạo lúc' }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
