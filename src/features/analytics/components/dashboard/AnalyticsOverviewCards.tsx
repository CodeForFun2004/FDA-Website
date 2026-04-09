'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/libs/utils';
import { Clock, Database, Gauge, ShieldAlert, Activity } from 'lucide-react';
import type {
  JobRun,
  JobStatus
} from '@/features/analytics/types/analytics.dashboard.types';

function statusToVariant(status: JobStatus) {
  if (status === 'SUCCESS') return 'success';
  if (status === 'FAILED') return 'destructive';
  if (status === 'RUNNING') return 'warning';
  return 'outline';
}

function fmt(n: number) {
  return Intl.NumberFormat('en-US').format(n);
}

function getLastSuccessfulRun(runs: JobRun[]) {
  return runs.find((r) => r.status === 'SUCCESS') ?? null;
}

function withinHours(iso: string, hours: number) {
  const t = new Date(iso).getTime();
  const now = Date.now();
  return now - t <= hours * 3600 * 1000;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString();
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function AnalyticsOverviewCards(props: {
  jobRuns: JobRun[];
  aggregatedRecordsTotal: number;
  latestCalculatedAt?: string | null;
}) {
  const runs = props.jobRuns;
  const totalRuns = runs.length;
  const running = runs.filter((r) => r.status === 'RUNNING').length;
  const failed24h = runs.filter(
    (r) => r.status === 'FAILED' && withinHours(r.startedAt, 24)
  ).length;
  const lastOk = getLastSuccessfulRun(runs);

  const freshnessMinutes = props.latestCalculatedAt
    ? Math.round(
        (Date.now() - new Date(props.latestCalculatedAt).getTime()) / 60000
      )
    : null;

  type KpiTone = 'neutral' | 'warning' | 'danger';
  type KpiRow = {
    label: string;
    value: string;
    caption: string;
    icon: typeof Activity;
    tone?: KpiTone;
    badge?: {
      text: string;
      variant: ReturnType<typeof statusToVariant>;
    } | null;
  };

  const kpis: KpiRow[] = [
    {
      label: 'Total runs',
      value: fmt(totalRuns),
      caption: 'All job types',
      icon: Activity
    },
    {
      label: 'Running',
      value: fmt(running),
      caption: 'Active executions',
      icon: Gauge,
      tone: running > 0 ? 'warning' : 'neutral'
    },
    {
      label: 'Last successful',
      value: lastOk
        ? fmtDate(new Date(lastOk.finishedAt ?? lastOk.startedAt))
        : '—',
      caption: lastOk
        ? `${fmtTime(new Date(lastOk.finishedAt ?? lastOk.startedAt))} • ${lastOk.jobType}`
        : 'No successful run yet',
      icon: Clock,
      badge: lastOk
        ? { text: lastOk.jobType, variant: statusToVariant(lastOk.status) }
        : null
    },
    {
      label: 'Failed (24h)',
      value: fmt(failed24h),
      caption: failed24h > 0 ? 'Needs attention' : 'No recent failures',
      icon: ShieldAlert,
      tone: failed24h > 0 ? 'danger' : 'neutral'
    },
    {
      label: 'Aggregated records',
      value: fmt(props.aggregatedRecordsTotal),
      caption: 'Created across runs',
      icon: Database
    },
    {
      label: 'Data freshness',
      value: freshnessMinutes === null ? '—' : `${freshnessMinutes}m`,
      caption: props.latestCalculatedAt
        ? `calculatedAt ${new Date(props.latestCalculatedAt).toLocaleString()}`
        : 'Unknown',
      icon: Clock,
      tone:
        freshnessMinutes !== null && freshnessMinutes > 180
          ? 'warning'
          : 'neutral'
    }
  ];

  return (
    <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-6'>
      {kpis.map((k) => (
        <Card key={k.label} className='border-border shadow-none'>
          <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
            <div className='space-y-1'>
              <CardTitle className='text-muted-foreground text-xs font-medium'>
                {k.label}
              </CardTitle>
              {k.badge ? (
                <Badge variant={k.badge.variant} className='mt-1'>
                  {k.badge.text}
                </Badge>
              ) : null}
            </div>
            <k.icon
              className={cn(
                'h-4 w-4',
                k.tone === 'danger'
                  ? 'text-destructive'
                  : k.tone === 'warning'
                    ? 'text-orange-600'
                    : 'text-muted-foreground'
              )}
            />
          </CardHeader>
          <CardContent className='space-y-1'>
            <div className='text-foreground min-h-[28px] text-lg leading-tight font-semibold'>
              {k.value}
            </div>
            <p className='text-muted-foreground text-xs leading-relaxed'>
              {k.caption}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
