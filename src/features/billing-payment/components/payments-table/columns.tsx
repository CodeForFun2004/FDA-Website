'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type {
  AdminPaymentRecord,
  PaymentStatus
} from '../../types/billing-payment.type';

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + ' VND';
}

function formatDateTime(iso: string | null) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('vi-VN');
  } catch {
    return iso;
  }
}

function getStatusConfig(status: PaymentStatus) {
  switch (status) {
    case 'paid':
      return {
        label: 'Đã thanh toán',
        className:
          'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 hover:bg-green-500/20'
      };
    case 'pending':
      return {
        label: 'Chờ xử lý',
        className:
          'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
      };
    case 'cancelled':
      return {
        label: 'Đã hủy',
        className:
          'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 hover:bg-red-500/20'
      };
    default:
      return { label: status, className: '' };
  }
}

export const PAYMENT_STATUS_OPTIONS = [
  { label: 'Đã thanh toán', value: 'paid' },
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đã hủy', value: 'cancelled' }
];

export function getPaymentColumns(params: {
  onRowClick: (payment: AdminPaymentRecord) => void;
}): ColumnDef<AdminPaymentRecord>[] {
  const { onRowClick } = params;

  return [
    {
      id: 'stt',
      header: () => (
        <div className='text-muted-foreground w-full text-center text-xs font-semibold tracking-wider uppercase'>
          #
        </div>
      ),
      cell: ({ row }) => (
        <div className='text-center text-sm text-slate-400 tabular-nums'>
          {String(row.index + 1).padStart(2, '0')}
        </div>
      ),
      size: 50,
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      id: 'orderCode',
      accessorKey: 'orderCode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Mã đơn' />
      ),
      cell: ({ row }) => (
        <button
          type='button'
          onClick={() => onRowClick(row.original)}
          className='text-primary text-left font-mono font-semibold tabular-nums underline-offset-2 hover:underline'
        >
          {row.original.orderCode}
        </button>
      ),
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: 'Tìm kiếm',
        viewLabel: 'Mã đơn',
        placeholder: 'Tìm theo mã đơn, người dùng, gói…',
        variant: 'text' as const
      }
    },
    {
      id: 'user',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Người dùng' />
      ),
      cell: ({ row }) => (
        <div className='flex min-w-[220px] flex-col'>
          <span className='text-foreground font-semibold'>
            {row.original.userFullName}
          </span>
          <span className='text-muted-foreground line-clamp-1 text-xs'>
            {row.original.userEmail}
          </span>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        viewLabel: 'Người dùng'
      }
    },
    {
      id: 'plan',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Gói' />
      ),
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='text-foreground font-semibold'>
            {row.original.planName}
          </span>
          <span className='text-muted-foreground font-mono text-xs'>
            {row.original.planCode}
          </span>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        viewLabel: 'Gói'
      }
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Số tiền' />
      ),
      cell: ({ row }) => (
        <div className='font-medium tabular-nums'>
          {formatVnd(row.original.amount)}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        viewLabel: 'Số tiền'
      }
    },
    {
      id: 'durationMonths',
      accessorKey: 'durationMonths',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Thời hạn' />
      ),
      cell: ({ row }) => (
        <div className='text-muted-foreground'>
          {row.original.durationMonths} tháng
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        viewLabel: 'Thời hạn'
      }
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Trạng thái' />
      ),
      cell: ({ row }) => {
        const config = getStatusConfig(row.original.status);
        return (
          <Badge
            variant='default'
            className={`font-medium ${config.className}`}
          >
            {config.label}
          </Badge>
        );
      },
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: 'Trạng thái',
        viewLabel: 'Trạng thái',
        variant: 'select' as const,
        options: PAYMENT_STATUS_OPTIONS
      }
    },
    {
      id: 'paymentDate',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Ngày thanh toán'
          className='whitespace-nowrap'
        />
      ),
      cell: ({ row }) => (
        <div className='text-muted-foreground text-sm'>
          {formatDateTime(row.original.paidAt ?? row.original.createdAt)}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        viewLabel: 'Ngày thanh toán'
      },
      size: 160
    }
  ];
}
