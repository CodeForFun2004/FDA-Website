'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { PricingPlan } from '@/features/plan-subscriptions/types/plan-subscription.type';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, XCircle, Layers, Sparkles } from 'lucide-react';
import { CellAction } from './cell-action';

/** Format Vietnamese price: 49000 -> "49.000 VND" */
export function formatVndPrice(value: number): string {
  if (value === 0) return 'Free';
  return new Intl.NumberFormat('vi-VN').format(value) + ' VND';
}

function getTierConfig(tier: string) {
  const configs: Record<
    string,
    { label: string; className: string; dotColor: string }
  > = {
    Free: {
      label: 'Free',
      className:
        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300/50',
      dotColor: 'bg-slate-400'
    },
    Basic: {
      label: 'Basic',
      className:
        'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-300/50',
      dotColor: 'bg-blue-400'
    },
    Premium: {
      label: 'Premium',
      className:
        'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border-violet-300/50',
      dotColor: 'bg-violet-500'
    },
    Monitor: {
      label: 'Monitor',
      className:
        'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300/50',
      dotColor: 'bg-amber-500'
    }
  };
  return (
    configs[tier] ?? {
      label: tier,
      className: 'bg-gray-100 text-gray-700 border-gray-300/50',
      dotColor: 'bg-gray-400'
    }
  );
}

export const columns: ColumnDef<PricingPlan>[] = [
  // Row index
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

  // Code
  {
    id: 'code',
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Code' />
    ),
    cell: ({ cell }) => (
      <div className='text-primary font-mono font-semibold tracking-wide'>
        {String(cell.getValue() ?? '-')}
      </div>
    ),
    enableColumnFilter: false
  },

  // Name
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Plan Name' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col gap-0.5'>
        <span className='text-foreground font-semibold'>
          {row.original.name}
        </span>
        {row.original.description && (
          <span className='text-muted-foreground line-clamp-1 max-w-[220px] text-xs'>
            {row.original.description}
          </span>
        )}
      </div>
    ),
    meta: {
      label: 'Search',
      placeholder: 'Search code/plan name ...',
      variant: 'text'
    },
    enableColumnFilter: true
  },

  // Price / Month
  {
    id: 'priceMonth',
    accessorKey: 'priceMonth',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price / Month' />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      const isFree = value === 0;
      return (
        <div
          className={`font-medium tabular-nums ${isFree ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}
        >
          {formatVndPrice(value)}
        </div>
      );
    },
    enableColumnFilter: false
  },

  // Price / Year
  {
    id: 'priceYear',
    accessorKey: 'priceYear',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price / Year' />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      return (
        <div className='text-muted-foreground text-sm tabular-nums'>
          {formatVndPrice(value)}
        </div>
      );
    },
    enableColumnFilter: false
  },

  // Tier
  {
    id: 'tier',
    accessorKey: 'tier',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tier' />
    ),
    cell: ({ cell }) => {
      const tier = cell.getValue() as string;
      const config = getTierConfig(tier);
      return (
        <Badge
          variant='outline'
          className={`gap-1.5 text-xs font-medium ${config.className}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
          {config.label}
        </Badge>
      );
    },
    enableColumnFilter: false
  },

  // Status
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const isActive = cell.getValue() as boolean;
      return isActive ? (
        <Badge
          variant='outline'
          className='gap-1.5 border-emerald-500/20 bg-emerald-500/10 font-medium text-emerald-700 dark:text-emerald-400'
        >
          <CheckCircle2 className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
          Active
        </Badge>
      ) : (
        <Badge
          variant='outline'
          className='gap-1.5 border-slate-300/50 bg-slate-100 font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400'
        >
          <XCircle className='h-3.5 w-3.5' />
          Inactive
        </Badge>
      );
    },
    enableColumnFilter: false
  },

  // Features count
  {
    id: 'features',
    accessorKey: 'features',
    header: () => (
      <div className='text-muted-foreground text-center text-xs font-semibold tracking-wider uppercase'>
        Features
      </div>
    ),
    cell: ({ row }) => {
      const features = row.original.features;
      const count = features?.length ?? 0;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex cursor-default items-center justify-center gap-1.5'>
                <Sparkles className='h-3.5 w-3.5 text-violet-500' />
                <span className='text-sm font-medium tabular-nums'>
                  {count}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent className='max-w-xs' align='center'>
              {count === 0 ? (
                <p className='text-xs'>No features defined</p>
              ) : (
                <ul className='space-y-1'>
                  {features.map((f) => (
                    <li key={f.id} className='text-xs'>
                      <span className='font-medium'>{f.featureName}:</span>{' '}
                      {f.featureValue}
                    </li>
                  ))}
                </ul>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableColumnFilter: false,
    size: 90
  },

  // Sort Order
  {
    id: 'sortOrder',
    accessorKey: 'sortOrder',
    header: () => (
      <div className='text-muted-foreground text-center text-xs font-semibold tracking-wider uppercase'>
        Order
      </div>
    ),
    cell: ({ cell }) => (
      <div className='text-muted-foreground text-center text-sm tabular-nums'>
        {cell.getValue() as number}
      </div>
    ),
    enableColumnFilter: false,
    size: 70
  },

  // Actions
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
