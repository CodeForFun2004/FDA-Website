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
        label: 'Paid',
        className:
          'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 hover:bg-green-500/20'
      };
    case 'pending':
      return {
        label: 'Pending',
        className:
          'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        className:
          'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 hover:bg-red-500/20'
      };
    default:
      return { label: status, className: '' };
  }
}

export const PAYMENT_STATUS_OPTIONS = [
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Cancelled', value: 'cancelled' }
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
        <DataTableColumnHeader column={column} title='Order Code' />
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
        label: 'Search',
        placeholder: 'Search order code, user, plan...',
        variant: 'text' as const
      }
    },
    {
      id: 'user',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='User' />
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
      enableColumnFilter: false
    },
    {
      id: 'plan',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Plan' />
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
      enableColumnFilter: false
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Amount' />
      ),
      cell: ({ row }) => (
        <div className='font-medium tabular-nums'>
          {formatVnd(row.original.amount)}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      id: 'durationMonths',
      accessorKey: 'durationMonths',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Duration' />
      ),
      cell: ({ row }) => (
        <div className='text-muted-foreground'>
          {row.original.durationMonths} month
          {row.original.durationMonths === 1 ? '' : 's'}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
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
        label: 'Status',
        variant: 'select' as const,
        options: PAYMENT_STATUS_OPTIONS
      }
    },
    {
      id: 'paymentDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Payment Date' />
      ),
      cell: ({ row }) => (
        <div className='text-muted-foreground text-sm'>
          {formatDateTime(row.original.paidAt ?? row.original.createdAt)}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false
    }
  ];
}
