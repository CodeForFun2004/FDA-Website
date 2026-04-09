'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import * as Recharts from 'recharts';
import type { SeverityAnalyticsPoint } from '@/features/analytics/types/analytics.dashboard.types';

export function SeverityChartCard(props: { data: SeverityAnalyticsPoint[] }) {
  const maxOfMax = props.data.reduce((m, p) => Math.max(m, p.maxLevel), 0);
  const avgReading = props.data.length
    ? Math.round(
        props.data.reduce((s, p) => s + p.readingCount, 0) / props.data.length
      )
    : 0;
  const totalDuration = props.data.reduce((s, p) => s + p.durationHours, 0);

  return (
    <Card className='border-border shadow-none'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm'>Severity trend</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-3 gap-3 text-xs'>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground'>Highest maxLevel</div>
            <div className='text-foreground mt-1 text-base font-semibold'>
              {maxOfMax ? maxOfMax.toFixed(2) : '—'}
            </div>
          </div>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground'>Total durationHours</div>
            <div className='text-foreground mt-1 text-base font-semibold'>
              {totalDuration ? totalDuration.toFixed(1) : '—'}
            </div>
          </div>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground'>Avg readingCount</div>
            <div className='text-foreground mt-1 text-base font-semibold'>
              {avgReading ? Intl.NumberFormat('en-US').format(avgReading) : '—'}
            </div>
          </div>
        </div>

        <div className='h-[280px]'>
          <ChartContainer
            config={{
              maxLevel: { label: 'Max', color: 'hsl(var(--primary))' },
              avgLevel: { label: 'Avg', color: 'hsl(var(--muted-foreground))' },
              minLevel: { label: 'Min', color: 'hsl(var(--border))' }
            }}
          >
            <Recharts.LineChart
              data={props.data}
              margin={{ left: 8, right: 8 }}
            >
              <Recharts.CartesianGrid strokeDasharray='3 3' />
              <Recharts.XAxis
                dataKey='timeBucket'
                tickFormatter={(v) => new Date(v).toLocaleDateString()}
                minTickGap={24}
              />
              <Recharts.YAxis />
              <ChartTooltip
                content={<ChartTooltipContent indicator='line' />}
              />
              <Recharts.Line
                type='monotone'
                dataKey='maxLevel'
                stroke='var(--color-maxLevel)'
                strokeWidth={2.2}
                dot={false}
              />
              <Recharts.Line
                type='monotone'
                dataKey='avgLevel'
                stroke='var(--color-avgLevel)'
                strokeWidth={2}
                dot={false}
                strokeDasharray='4 4'
              />
              <Recharts.Line
                type='monotone'
                dataKey='minLevel'
                stroke='var(--color-minLevel)'
                strokeWidth={1.6}
                dot={false}
              />
            </Recharts.LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
