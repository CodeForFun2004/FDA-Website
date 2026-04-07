'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { JobRun } from '@/features/analytics/types/analytics.dashboard.types';

type TriggerType = 'frequency' | 'severity' | 'hotspots';

function lastByType(runs: JobRun[], type: JobRun['jobType']) {
  return runs.find((r) => r.jobType === type) ?? null;
}

function statusVariant(status?: string | null) {
  if (status === 'SUCCESS') return 'success';
  if (status === 'FAILED') return 'destructive';
  if (status === 'RUNNING') return 'warning';
  return 'outline';
}

export function AggregationActionsPanel(props: {
  jobRuns: JobRun[];
  activeType?: TriggerType;
  onTabChange?: (type: TriggerType) => void;
  onRunNow: (type: TriggerType) => void;
  onViewHistory: () => void;
}) {
  const freq = lastByType(props.jobRuns, 'FREQUENCY');
  const sev = lastByType(props.jobRuns, 'SEVERITY');
  const hot = lastByType(props.jobRuns, 'HOTSPOTS');

  const blocks = {
    frequency: {
      title: 'Frequency aggregation',
      note: 'Bucketed eventCount / exceedCount by time & area.',
      schedule: 'Daily 02:00 (Asia/Ho_Chi_Minh)',
      last: freq
    },
    severity: {
      title: 'Severity aggregation',
      note: 'max/avg/min level + duration + readingCount per bucket.',
      schedule: 'Daily 02:10 (Asia/Ho_Chi_Minh)',
      last: sev
    },
    hotspots: {
      title: 'Hotspot ranking',
      note: 'Top-N ranking for reporting (FE-18 ready).',
      schedule: 'Weekly Mon 03:00 (Asia/Ho_Chi_Minh)',
      last: hot
    }
  } as const;

  const renderBlock = (t: TriggerType) => {
    const b = blocks[t];
    const last = b.last;
    return (
      <div className='space-y-4'>
        <div className='space-y-1'>
          <div className='text-foreground text-sm font-medium'>{b.title}</div>
          <div className='text-muted-foreground text-xs leading-relaxed'>
            {b.note}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3 text-xs'>
          <div className='space-y-1'>
            <div className='text-muted-foreground'>Last status</div>
            <div>
              <Badge variant={statusVariant(last?.status) as any}>
                {last?.status ?? 'UNKNOWN'}
              </Badge>
            </div>
          </div>
          <div className='space-y-1'>
            <div className='text-muted-foreground'>Last run</div>
            <div className='text-foreground'>
              {last
                ? new Date(last.finishedAt ?? last.startedAt).toLocaleString()
                : '—'}
            </div>
          </div>
          <div className='space-y-1'>
            <div className='text-muted-foreground'>Next schedule</div>
            <div className='text-foreground'>{b.schedule}</div>
          </div>
          <div className='space-y-1'>
            <div className='text-muted-foreground'>Idempotent</div>
            <div className='text-foreground'>
              Upsert / overwrite (no double count)
            </div>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Button type='button' onClick={() => props.onRunNow(t)}>
            Run now
          </Button>
          <Button type='button' variant='outline' onClick={props.onViewHistory}>
            View history
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className='border-border shadow-none'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm'>Aggregation operations</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={props.activeType ?? 'frequency'}
          onValueChange={(v) => props.onTabChange?.(v as TriggerType)}
        >
          <TabsList className='w-fit justify-start'>
            <TabsTrigger
              value='frequency'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Frequency
            </TabsTrigger>
            <TabsTrigger
              value='severity'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Severity
            </TabsTrigger>
            <TabsTrigger
              value='hotspots'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Hotspots
            </TabsTrigger>
          </TabsList>
          <TabsContent value='frequency'>
            {renderBlock('frequency')}
          </TabsContent>
          <TabsContent value='severity'>{renderBlock('severity')}</TabsContent>
          <TabsContent value='hotspots'>{renderBlock('hotspots')}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
