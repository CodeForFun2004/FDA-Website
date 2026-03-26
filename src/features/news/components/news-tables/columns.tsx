'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Announcement } from '@/features/news/types/news.type';
import type { Column, ColumnDef } from '@tanstack/react-table';
import {
  AlertTriangle,
  AlertCircle,
  Text,
  Target,
  Clock,
  Globe,
  Eye
} from 'lucide-react';
import { CellAction } from './cell-action';

export const NEWS_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Published', value: 'published' },
  { label: 'Cancelled', value: 'cancelled' }
];

export const NEWS_PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' }
];

function formatDate(dateString: string | null) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatTarget(target: string, targetValue: string | null) {
  if (target === 'all') return 'Tất cả';
  if (target === 'region') return `Khu vực: ${targetValue || '—'}`;
  if (target === 'role') return `Vai trò: ${targetValue || '—'}`;
  return target;
}

export const getNewsColumns = (
  onRefresh?: () => void
): ColumnDef<Announcement>[] => [
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }: { column: Column<Announcement, unknown> }) => (
      <DataTableColumnHeader column={column} title='Tiêu đề' />
    ),
    cell: ({ row }) => (
      <div className='min-w-[200px]'>
        <div className='line-clamp-2 font-medium'>{row.original.title}</div>
        {row.original.summary && (
          <div className='text-muted-foreground mt-0.5 line-clamp-1 text-xs'>
            {row.original.summary}
          </div>
        )}
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: 'Tiêu đề',
      placeholder: 'Tìm kiếm tiêu đề...',
      variant: 'text',
      icon: Text
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<Announcement, unknown> }) => (
      <DataTableColumnHeader column={column} title='Trạng thái' />
    ),
    cell: ({ cell }) => {
      const status = String(cell.getValue() ?? '').toLowerCase();
      const configs: Record<
        string,
        {
          variant: 'default' | 'secondary' | 'outline';
          className: string;
          icon: typeof AlertCircle;
          label: string;
        }
      > = {
        draft: {
          variant: 'outline',
          className: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
          icon: Text,
          label: 'Bản nháp'
        },
        pending: {
          variant: 'default',
          className:
            'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
          icon: Clock,
          label: 'Chờ đăng'
        },
        published: {
          variant: 'default',
          className:
            'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
          icon: Globe,
          label: 'Đã đăng'
        },
        cancelled: {
          variant: 'outline',
          className:
            'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
          icon: AlertCircle,
          label: 'Đã hủy'
        }
      };
      const config = configs[status] ?? {
        variant: 'outline',
        className: '',
        icon: AlertCircle,
        label: status
      };
      const Icon = config.icon;
      return (
        <Badge
          variant={config.variant}
          className={`gap-1.5 font-medium ${config.className}`}
        >
          <Icon className='h-3.5 w-3.5' />
          {config.label}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Trạng thái',
      variant: 'multiSelect',
      options: NEWS_STATUS_OPTIONS
    }
  },
  {
    id: 'priority',
    accessorKey: 'priority',
    header: ({ column }: { column: Column<Announcement, unknown> }) => (
      <DataTableColumnHeader column={column} title='Độ ưu tiên' />
    ),
    cell: ({ cell }) => {
      const priority = String(cell.getValue() ?? '').toLowerCase();
      const configs: Record<
        string,
        {
          variant: 'default' | 'secondary' | 'outline';
          className: string;
          icon: typeof AlertCircle;
          label: string;
        }
      > = {
        low: {
          variant: 'outline',
          className: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
          icon: Text,
          label: 'Thấp'
        },
        normal: {
          variant: 'default',
          className:
            'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
          icon: Text,
          label: 'Bình thường'
        },
        high: {
          variant: 'default',
          className:
            'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
          icon: AlertTriangle,
          label: 'Cao'
        },
        urgent: {
          variant: 'default',
          className:
            'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
          icon: AlertTriangle,
          label: 'Khẩn cấp'
        }
      };
      const config = configs[priority] ?? {
        variant: 'outline',
        className: '',
        icon: AlertCircle,
        label: priority
      };
      const Icon = config.icon;
      return (
        <Badge
          variant={config.variant}
          className={`gap-1.5 font-medium ${config.className}`}
        >
          <Icon className='h-3.5 w-3.5' />
          {config.label}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Độ ưu tiên',
      variant: 'multiSelect',
      options: NEWS_PRIORITY_OPTIONS
    }
  },
  {
    id: 'target',
    accessorKey: 'target',
    header: ({ column }: { column: Column<Announcement, unknown> }) => (
      <DataTableColumnHeader column={column} title='Đối tượng' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex min-w-[120px] items-center gap-1.5'>
          <Target className='text-muted-foreground h-3.5 w-3.5' />
          <span className='text-sm'>
            {formatTarget(row.original.target, row.original.targetValue)}
          </span>
        </div>
      );
    }
  },
  {
    id: 'scheduledAt',
    accessorKey: 'scheduledAt',
    header: ({ column }: { column: Column<Announcement, unknown> }) => (
      <DataTableColumnHeader column={column} title='Lịch đăng' />
    ),
    cell: ({ cell }) => (
      <div className='text-muted-foreground min-w-[140px] text-sm'>
        {cell.getValue() ? formatDate(cell.getValue() as string) : '—'}
      </div>
    )
  },
  {
    id: 'publishedAt',
    accessorKey: 'publishedAt',
    header: ({ column }: { column: Column<Announcement, unknown> }) => (
      <DataTableColumnHeader column={column} title='Đã đăng lúc' />
    ),
    cell: ({ cell }) => (
      <div className='text-muted-foreground min-w-[140px] text-sm'>
        {cell.getValue() ? formatDate(cell.getValue() as string) : '—'}
      </div>
    )
  },
  {
    id: 'authorName',
    accessorKey: 'authorName',
    header: ({ column }: { column: Column<Announcement, unknown> }) => (
      <DataTableColumnHeader column={column} title='Tác giả' />
    ),
    cell: ({ cell }) => (
      <div className='min-w-[140px] text-sm'>
        {String(cell.getValue() ?? '—')}
      </div>
    )
  },
  {
    id: 'viewCount',
    accessorKey: 'viewCount',
    header: ({ column }: { column: Column<Announcement, unknown> }) => (
      <DataTableColumnHeader column={column} title='Lượt xem' />
    ),
    cell: ({ cell }) => (
      <div className='flex min-w-[80px] items-center gap-1'>
        <Eye className='text-muted-foreground h-3.5 w-3.5' />
        <span className='text-sm'>{cell.getValue() as number}</span>
      </div>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} onRefresh={onRefresh} />
  }
];

export const columns = getNewsColumns();
