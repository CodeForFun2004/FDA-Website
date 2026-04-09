'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { RefreshCcw, Activity, ChevronDown } from 'lucide-react';

type TriggerType = 'frequency' | 'severity' | 'hotspots';

type ActiveTab = 'overview' | 'jobs' | 'results' | 'operations';

// Per-tab heading config
const TAB_META: Record<ActiveTab, { title: string; description: string }> = {
  overview: {
    title: 'Analytics Overview',
    description:
      'Aggregation activity overview — running jobs, data freshness and key KPIs.'
  },
  jobs: {
    title: 'Job Monitor',
    description:
      'Real-time monitoring of running aggregation jobs and result history.'
  },
  results: {
    title: 'Analytics Results',
    description:
      'View frequency, severity and hotspot ranking results by selected bucket/area.'
  },
  operations: {
    title: 'Aggregation Operations',
    description:
      'Manually trigger aggregation jobs (frequency, severity, hotspot) for a custom period/area.'
  }
};

export function AnalyticsHeader(props: {
  activeTab: ActiveTab;
  onRefresh: () => void;
  onOpenJobMonitor: () => void;
  onTrigger: (type: TriggerType) => void;
  isRefreshing?: boolean;
}) {
  const { activeTab } = props;
  const meta = TAB_META[activeTab] ?? TAB_META.overview;

  return (
    <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
      <div className='space-y-1'>
        <h2 className='text-3xl font-bold tracking-tight'>{meta.title}</h2>
        <p className='text-muted-foreground max-w-xl text-sm'>
          {meta.description}
        </p>
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <Button
          type='button'
          variant='outline'
          onClick={props.onRefresh}
          disabled={props.isRefreshing}
        >
          <RefreshCcw className='mr-2 h-4 w-4' />
          Refresh
        </Button>

        <Button
          type='button'
          variant='outline'
          onClick={props.onOpenJobMonitor}
        >
          <Activity className='mr-2 h-4 w-4' />
          Job monitor
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type='button'>
              Trigger
              <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel>Manual re-aggregation</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => props.onTrigger('frequency')}>
              Frequency aggregation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => props.onTrigger('severity')}>
              Severity aggregation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => props.onTrigger('hotspots')}>
              Hotspot ranking
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
