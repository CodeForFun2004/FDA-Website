'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Alert } from '@/features/alerts/types';
import type { Column, ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle2,
  Text,
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle
} from 'lucide-react';
import { CellAction } from './cell-action';
import { formatDate } from '@/libs/utils';

export const ALERT_STATUS_OPTIONS = [
  { label: 'New', value: 'New' },
  { label: 'Acknowledged', value: 'Acknowledged' },
  { label: 'Resolved', value: 'Resolved' }
];

export const ALERT_SEVERITY_OPTIONS = [
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Critical', value: 'Critical' }
];

export const columns: ColumnDef<Alert>[] = [
  {
    id: 'severity',
    accessorKey: 'severity',
    header: ({ column }: { column: Column<Alert, unknown> }) => (
      <DataTableColumnHeader column={column} title='Severity' />
    ),
    cell: ({ cell }) => {
      const severity = String(cell.getValue() ?? '');
      const variants: Record<string, string> = {
        Critical: 'bg-red-100 text-red-700 border-red-200',
        High: 'bg-orange-100 text-orange-700 border-orange-200',
        Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        Low: 'bg-blue-100 text-blue-700 border-blue-200'
      };
      return <Badge className={variants[severity] || ''}>{severity}</Badge>;
    },
    enableColumnFilter: true,
    meta: {
      label: 'Severity',
      variant: 'multiSelect',
      options: ALERT_SEVERITY_OPTIONS
    }
  },
  {
    id: 'message',
    accessorKey: 'message',
    header: ({ column }: { column: Column<Alert, unknown> }) => (
      <DataTableColumnHeader column={column} title='Message' />
    ),
    cell: ({ row }) => (
      <div className='max-w-xs truncate font-medium'>
        {row.original.title || String(row.getValue('message'))}
      </div>
    ),
    meta: {
      label: 'Message',
      placeholder: 'Search message...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'zone',
    accessorKey: 'zone',
    header: ({ column }: { column: Column<Alert, unknown> }) => (
      <DataTableColumnHeader column={column} title='Zone' />
    ),
    cell: ({ cell }) => (
      <div className='min-w-[120px]'>{String(cell.getValue() ?? '-')}</div>
    )
  },
  {
    id: 'timestamp',
    accessorKey: 'timestamp',
    header: ({ column }: { column: Column<Alert, unknown> }) => (
      <DataTableColumnHeader column={column} title='Time' />
    ),
    cell: ({ cell }) => (
      <div className='min-w-[150px]'>
        {formatDate(String(cell.getValue() ?? ''))}
      </div>
    )
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<Alert, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const status = String(cell.getValue() ?? '');

      const getBadgeConfig = (s: string) => {
        switch (s) {
          case 'New':
            return {
              variant: 'default' as const,
              className: '',
              icon: AlertCircle,
              iconClassName: ''
            };
          case 'Acknowledged':
            return {
              variant: 'secondary' as const,
              className: '',
              icon: Clock,
              iconClassName: ''
            };
          case 'Resolved':
            return {
              variant: 'success' as const,
              className: 'bg-emerald-500 text-white',
              icon: CheckCircle,
              iconClassName: ''
            };
          default:
            return {
              variant: 'outline' as const,
              className: '',
              icon: AlertTriangle,
              iconClassName: ''
            };
        }
      };

      const config = getBadgeConfig(status);
      const Icon = config.icon;

      return (
        <Badge
          variant={config.variant}
          className={`gap-1.5 font-medium ${config.className}`}
        >
          <Icon className={`h-3.5 w-3.5 ${config.iconClassName}`} />
          {status}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: ALERT_STATUS_OPTIONS
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
