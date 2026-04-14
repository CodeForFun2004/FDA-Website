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

export function SeverityChartCard(props: {
  data: SeverityAnalyticsPoint[];
  noOuterCard?: boolean;
}) {
  const maxOfMax = props.data.reduce((m, p) => Math.max(m, p.maxLevel), 0);
  const avgReading = props.data.length
    ? Math.round(
        props.data.reduce((s, p) => s + p.readingCount, 0) / props.data.length
      )
    : 0;
  const totalDuration = props.data.reduce((s, p) => s + p.durationHours, 0);
  const empty = props.data.length === 0;

  const body = (
    <div className='space-y-4'>
      {empty ? (
        <div className='text-muted-foreground flex h-[280px] items-center justify-center rounded-md border border-dashed text-sm'>
          Chưa có dữ liệu — chọn một khu vực và nhấn Áp dụng.
        </div>
      ) : null}
      {!empty ? (
        <div className='grid grid-cols-3 gap-3 text-xs'>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground'>Mức max cao nhất</div>
            <div className='text-foreground mt-1 text-base font-semibold'>
              {maxOfMax ? maxOfMax.toFixed(2) : '—'}
            </div>
          </div>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground'>Tổng giờ ngập</div>
            <div className='text-foreground mt-1 text-base font-semibold'>
              {totalDuration ? totalDuration.toFixed(1) : '—'}
            </div>
          </div>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground'>Số lần đo TB</div>
            <div className='text-foreground mt-1 text-base font-semibold'>
              {avgReading ? Intl.NumberFormat('en-US').format(avgReading) : '—'}
            </div>
          </div>
        </div>
      ) : null}

      {!empty ? (
        <div className='h-[280px]'>
          <ChartContainer
            config={{
              maxLevel: { label: 'Max', color: 'hsl(var(--primary))' },
              avgLevel: { label: 'TB', color: 'hsl(var(--muted-foreground))' },
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
      ) : null}
    </div>
  );

  if (props.noOuterCard) {
    return (
      <div className='space-y-3'>
        <h3 className='text-foreground text-sm font-semibold'>
          Xu hướng mức độ
        </h3>
        {body}
      </div>
    );
  }

  return (
    <Card className='border-border shadow-none'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm'>Xu hướng mức độ</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>{body}</CardContent>
    </Card>
  );
}
