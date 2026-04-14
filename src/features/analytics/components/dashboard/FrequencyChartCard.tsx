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
  /** Gộp trong card cha (bỏ viền Card lồng) */
  noOuterCard?: boolean;
}) {
  const totalEvents = props.data.reduce((s, p) => s + p.eventCount, 0);
  const totalExceed = props.data.reduce((s, p) => s + p.exceedCount, 0);
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
            <div className='text-muted-foreground'>Tổng sự kiện</div>
            <div className='text-foreground mt-1 text-base font-semibold'>
              {Intl.NumberFormat('en-US').format(totalEvents)}
            </div>
          </div>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground'>Tổng vượt ngưỡng</div>
            <div className='text-foreground mt-1 text-base font-semibold'>
              {Intl.NumberFormat('en-US').format(totalExceed)}
            </div>
          </div>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground'>Trung bình / bước</div>
            <div className='text-foreground mt-1 text-base font-semibold'>
              {props.data.length
                ? Intl.NumberFormat('en-US').format(
                    Math.round(totalEvents / props.data.length)
                  )
                : '—'}
            </div>
          </div>
        </div>
      ) : null}

      {!empty ? (
        <div className='h-[280px]'>
          <ChartContainer
            config={{
              eventCount: { label: 'Sự kiện', color: 'hsl(var(--primary))' },
              exceedCount: {
                label: 'Vượt ngưỡng',
                color: 'hsl(var(--destructive))'
              }
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
      ) : null}
    </div>
  );

  if (props.noOuterCard) {
    return (
      <div className='space-y-3'>
        <h3 className='text-foreground text-sm font-semibold'>
          Xu hướng tần suất
        </h3>
        {body}
      </div>
    );
  }

  return (
    <Card className='border-border shadow-none'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm'>Xu hướng tần suất</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>{body}</CardContent>
    </Card>
  );
}
