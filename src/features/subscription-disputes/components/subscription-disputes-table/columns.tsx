'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { AdminComplaint } from '../../types/subscription-dispute.type';
import type { SubscriptionDisputeStatus } from '../../types/subscription-dispute.type';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { SubscriptionDisputeCellAction } from './cell-action';

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('vi-VN');
  } catch {
    return iso;
  }
}

function StatusBadge({ status }: { status: SubscriptionDisputeStatus }) {
  switch (status) {
    case 'open':
      return (
        <Badge
          variant='outline'
          className='border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300'
        >
          Open
        </Badge>
      );
    case 'resolved':
      return (
        <Badge
          variant='outline'
          className='border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'
        >
          Resolved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge
          variant='outline'
          className='border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300'
        >
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge
          variant='outline'
          className='border-gray-200 bg-gray-50 text-gray-800'
        >
          {status}
        </Badge>
      );
  }
}

export function getSubscriptionDisputesColumns(params: {
  onViewDetails: (complaint: AdminComplaint) => void;
}): ColumnDef<AdminComplaint>[] {
  const { onViewDetails } = params;

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
      id: 'user',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='User' />
      ),
      cell: ({ row }) => (
        <div className='flex flex-col'>
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
      id: 'subject',
      accessorKey: 'subject',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Subject' />
      ),
      cell: ({ row }) => (
        <button
          type='button'
          onClick={() => onViewDetails(row.original)}
          className='text-primary text-left font-semibold underline-offset-2 hover:underline'
        >
          {row.original.subject}
        </button>
      ),
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: 'Search',
        placeholder: 'Search subject...',
        variant: 'text' as const
      }
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: 'Status',
        variant: 'select' as const,
        options: [
          { label: 'Open', value: 'open' },
          { label: 'Resolved', value: 'resolved' },
          { label: 'Rejected', value: 'rejected' }
        ]
      }
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Created' />
      ),
      cell: ({ row }) => (
        <div className='text-muted-foreground text-sm'>
          {formatDateTime(row.original.createdAt)}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <SubscriptionDisputeCellAction complaint={row.original} />
      ),
      enableSorting: false,
      enableColumnFilter: false
    }
  ];
}
