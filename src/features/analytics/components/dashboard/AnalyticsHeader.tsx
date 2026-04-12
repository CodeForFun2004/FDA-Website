'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { RefreshCcw, ServerCog, ChevronDown } from 'lucide-react';

type TriggerType = 'frequency' | 'severity' | 'hotspots';

export function AnalyticsHeader(props: {
  onRefresh: () => void;
  onTrigger: (type: TriggerType) => void;
  isRefreshing?: boolean;
}) {
  return (
    <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
      <div className='space-y-1'>
        <h2 className='text-3xl font-bold tracking-tight'>Analytics</h2>
        <p className='text-muted-foreground max-w-xl text-sm'>
          Ranking: Start/End + Hotspot level + Top N. Trend: Metric, Bucket,
          Area (chọn khu vực để gọi API).
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

        <Button type='button' variant='outline' asChild>
          <Link href='/admin/analytics/hangfire'>
            <ServerCog className='mr-2 h-4 w-4' />
            Background jobs
          </Link>
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
