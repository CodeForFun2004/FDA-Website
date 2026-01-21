'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { AlertSubscription } from '@/features/user-alert-subscription/types/alert-subscription.type';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, AlertCircle, Text, MapPin } from 'lucide-react';
import { CellAction } from './cell-action';

// options cho filter giống product
export const ALERT_SEVERITY_OPTIONS = [
  { label: 'Caution', value: 'caution' },
  { label: 'Warning', value: 'warning' },
  { label: 'Critical', value: 'critical' }
];

export const columns: ColumnDef<AlertSubscription>[] = [
  {
    id: 'userEmail',
    accessorKey: 'userEmail',
    header: ({ column }: { column: Column<AlertSubscription, unknown> }) => (
      <DataTableColumnHeader column={column} title='User Email' />
    ),
    cell: ({ cell }) => (
      <div className='min-w-[200px] font-medium'>{String(cell.getValue())}</div>
    ),
    meta: {
      label: 'User Email',
      placeholder: 'Search by user email...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'location',
    header: 'Location',
    cell: ({ row }) => {
      const { areaName, stationName } = row.original;
      const locationName = areaName || stationName || 'N/A';
      const locationType = areaName ? 'Area' : stationName ? 'Station' : '';

      return (
        <div className='min-w-[180px]'>
          <div className='flex items-center gap-2'>
            <MapPin className='text-muted-foreground h-3.5 w-3.5' />
            <div>
              <div className='font-medium'>{locationName}</div>
              {locationType && (
                <div className='text-muted-foreground text-xs'>
                  {locationType}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  },
  {
    id: 'minSeverity',
    accessorKey: 'minSeverity',
    header: ({ column }: { column: Column<AlertSubscription, unknown> }) => (
      <DataTableColumnHeader column={column} title='Min Severity' />
    ),
    cell: ({ cell }) => {
      const severity = String(cell.getValue() ?? '').toLowerCase();

      // Determine badge variant and styling based on severity
      const getBadgeConfig = (severity: string) => {
        switch (severity) {
          case 'caution':
            return {
              variant: 'default' as const,
              className:
                'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
              icon: AlertCircle,
              iconClassName: 'text-blue-600 dark:text-blue-400'
            };
          case 'warning':
            return {
              variant: 'default' as const,
              className:
                'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20',
              icon: AlertTriangle,
              iconClassName: 'text-yellow-600 dark:text-yellow-400'
            };
          case 'critical':
            return {
              variant: 'default' as const,
              className:
                'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 hover:bg-red-500/20',
              icon: AlertTriangle,
              iconClassName: 'text-red-600 dark:text-red-400'
            };
          default:
            return {
              variant: 'outline' as const,
              className: '',
              icon: AlertCircle,
              iconClassName: ''
            };
        }
      };

      const config = getBadgeConfig(severity);
      const Icon = config.icon;

      return (
        <Badge
          variant={config.variant}
          className={`gap-1.5 font-medium capitalize ${config.className}`}
        >
          <Icon className={`h-3.5 w-3.5 ${config.iconClassName}`} />
          {severity || 'unknown'}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Severity',
      variant: 'multiSelect',
      options: ALERT_SEVERITY_OPTIONS
    }
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }: { column: Column<AlertSubscription, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => {
      const date = new Date(cell.getValue() as string);
      return (
        <div className='text-muted-foreground min-w-[140px] text-sm'>
          {date.toLocaleDateString()}
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
