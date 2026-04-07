'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import * as Recharts from 'recharts';
import type { FrequencyAnalyticsPoint } from '@/features/analytics/types/analytics.dashboard.types';

export function FrequencyChartCard(props: {
  data: FrequencyAnalyticsPoint[];
  isEmpty?: boolean;
}) {
  const totalEvents = props.data.reduce((s, p) => s + p.eventCount, 0);
  const totalExceed = props.data.reduce((s, p) => s + p.exceedCount, 0);

  return (
    <Card className='border-border shadow-none'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm'>Frequency trend</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-3 gap-3 text-xs'>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground'>Total events</div>
            <div className='text-foreground mt-1 text-base font-semibold'>
              {Intl.NumberFormat('en-US').format(totalEvents)}
            </div>
          </div>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground'>Total exceed</div>
            <div className='text-foreground mt-1 text-base font-semibold'>
              {Intl.NumberFormat('en-US').format(totalExceed)}
            </div>
          </div>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground'>Avg / bucket</div>
            <div className='text-foreground mt-1 text-base font-semibold'>
              {props.data.length
                ? Intl.NumberFormat('en-US').format(
                    Math.round(totalEvents / props.data.length)
                  )
                : '—'}
            </div>
          </div>
        </div>

        <div className='h-[280px]'>
          <ChartContainer
            config={{
              eventCount: { label: 'Events', color: 'hsl(var(--primary))' },
              exceedCount: { label: 'Exceed', color: 'hsl(var(--destructive))' }
            }}
          >
            <Recharts.ComposedChart
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
              <ChartTooltip content={<ChartTooltipContent indicator='dot' />} />
              <Recharts.Bar
                dataKey='eventCount'
                fill='var(--color-eventCount)'
                radius={[4, 4, 0, 0]}
                opacity={0.85}
              />
              <Recharts.Line
                type='monotone'
                dataKey='exceedCount'
                stroke='var(--color-exceedCount)'
                strokeWidth={2}
                dot={false}
              />
            </Recharts.ComposedChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
