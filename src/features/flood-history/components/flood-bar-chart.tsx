'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { FLOOD_CHART_PLOT_CLASS } from '../constants/flood-chart-layout';
import type { FloodTrendDto } from '../types/flood-history.type';

interface FloodBarChartProps {
  trendData: FloodTrendDto | null;
  isLoading?: boolean;
}

export function FloodBarChart({ trendData, isLoading }: FloodBarChartProps) {
  const chartData = useMemo(() => {
    if (!trendData?.dataPoints) return [];

    return trendData.dataPoints.map((point) => ({
      period: point.period,
      maxLevel: point.maxLevel,
      avgLevel: point.avgLevel,
      minLevel: point.minLevel,
      floodHours: point.floodHours,
      date: new Date(point.periodStart).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }));
  }, [trendData]);

  const chartConfig = {
    maxLevel: {
      label: 'Mực max (cm)',
      color: 'hsl(var(--destructive))'
    },
    avgLevel: {
      label: 'Mực TB (cm)',
      color: 'hsl(var(--primary))'
    },
    minLevel: {
      label: 'Mực min (cm)',
      color: 'hsl(var(--muted))'
    }
  } satisfies ChartConfig;

  if (isLoading) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <div className='bg-muted h-6 animate-pulse rounded'></div>
          <div className='bg-muted mt-2 h-4 animate-pulse rounded'></div>
        </CardHeader>
        <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
          <div
            className={`bg-muted w-full animate-pulse rounded ${FLOOD_CHART_PLOT_CLASS}`}
          />
        </CardContent>
      </Card>
    );
  }

  if (!trendData || !chartData.length) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Phân tích ngập</CardTitle>
          <CardDescription>Chưa có dữ liệu cột</CardDescription>
        </CardHeader>
        <CardContent
          className={`text-muted-foreground flex items-center justify-center ${FLOOD_CHART_PLOT_CLASS}`}
        >
          Không có dữ liệu
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Phân tích ngập</CardTitle>
        <CardDescription>
          {trendData.stationName} — Mực max/TB theo ngày (di chuột để xem giờ
          ngập)
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer config={chartConfig} className={FLOOD_CHART_PLOT_CLASS}>
          <BarChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}cm`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Ngày: ${value}`}
                  formatter={(value, name, item, _index, row) => {
                    const fh = (row as { floodHours?: number })?.floodHours;
                    const base = `${value} cm`;
                    if (item.dataKey === 'maxLevel' && fh != null) {
                      return (
                        <div className='flex w-full flex-wrap items-center justify-between gap-2'>
                          <span className='text-muted-foreground'>{name}</span>
                          <span className='font-mono font-medium'>
                            {base} · {fh}h ngập
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div className='flex w-full flex-wrap items-center justify-between gap-2'>
                        <span className='text-muted-foreground'>{name}</span>
                        <span className='font-mono font-medium'>{base}</span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Bar
              dataKey='maxLevel'
              fill='var(--color-maxLevel)'
              radius={[2, 2, 0, 0]}
              name='Mực max'
            />
            <Bar
              dataKey='avgLevel'
              fill='var(--color-avgLevel)'
              radius={[2, 2, 0, 0]}
              name='Mực TB'
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
