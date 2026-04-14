'use client';

import { useMemo } from 'react';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/libs/utils';
import { FLOOD_CHART_PLOT_CLASS } from '../constants/flood-chart-layout';
import type { FloodTrendDto } from '../types/flood-history.type';

interface FloodTrendGraphProps {
  trendData: FloodTrendDto | null;
  isLoading?: boolean;
  className?: string;
}

export function FloodTrendGraph({
  trendData,
  isLoading,
  className
}: FloodTrendGraphProps) {
  const chartData = useMemo(() => {
    if (!trendData?.dataPoints) return [];

    return trendData.dataPoints.map((point) => ({
      period: point.period,
      avgLevel: point.avgLevel,
      maxLevel: point.maxLevel,
      floodHours: point.floodHours,
      date: new Date(point.periodStart).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(trendData.granularity !== 'daily' && { year: 'numeric' })
      })
    }));
  }, [trendData]);

  const chartConfig = {
    avgLevel: {
      label: 'Mực nước TB (cm)',
      color: 'var(--primary)'
    },
    maxLevel: {
      label: 'Mực nước max (cm)',
      color: 'var(--primary)'
    }
  } satisfies ChartConfig;

  if (isLoading) {
    return (
      <Card
        className={cn(
          '@container/card flex h-full min-h-0 flex-col',
          className
        )}
      >
        <CardHeader className='shrink-0'>
          <div className='bg-muted h-6 animate-pulse rounded'></div>
          <div className='bg-muted mt-2 h-4 animate-pulse rounded'></div>
        </CardHeader>
        <CardContent className='flex min-h-0 flex-1 flex-col px-2 pt-4 sm:px-6 sm:pt-6'>
          <div
            className={cn(
              'bg-muted w-full animate-pulse rounded',
              FLOOD_CHART_PLOT_CLASS
            )}
          />
        </CardContent>
      </Card>
    );
  }

  if (!trendData || !chartData.length) {
    return (
      <Card
        className={cn(
          '@container/card flex h-full min-h-0 flex-col',
          className
        )}
      >
        <CardHeader className='shrink-0'>
          <CardTitle>Phân tích ngập</CardTitle>
          <CardDescription>Chưa có dữ liệu xu hướng</CardDescription>
        </CardHeader>
        <CardContent
          className={cn(
            'text-muted-foreground flex flex-1 items-center justify-center',
            FLOOD_CHART_PLOT_CLASS
          )}
        >
          Không có dữ liệu
        </CardContent>
      </Card>
    );
  }

  const { comparison } = trendData;
  const hasComparison =
    comparison && (comparison.avgLevelChange || comparison.floodHoursChange);

  return (
    <Card
      className={cn('@container/card flex h-full min-h-0 flex-col', className)}
    >
      <CardHeader className='shrink-0'>
        <CardTitle>Phân tích ngập</CardTitle>
        <CardDescription>
          {trendData.stationName} —{' '}
          {trendData.period.replace(/([A-Z])/g, ' $1').toLowerCase()}
          {trendData.granularity && ` (${trendData.granularity})`}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex min-h-0 flex-1 flex-col px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer config={chartConfig} className={FLOOD_CHART_PLOT_CLASS}>
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillAvgLevel' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-avgLevel)'
                  stopOpacity={0.3}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-avgLevel)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
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
                  indicator='dot'
                  labelFormatter={(value) => `Kỳ: ${value}`}
                  formatter={(value, name) => [
                    `${value} cm`,
                    name === 'avgLevel' ? 'Mực TB' : 'Mực max'
                  ]}
                />
              }
            />
            <Area
              dataKey='avgLevel'
              type='natural'
              fill='url(#fillAvgLevel)'
              stroke='var(--color-avgLevel)'
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {hasComparison && (
        <CardFooter className='max-h-[72px] shrink-0 overflow-y-auto border-t py-3'>
          <div className='flex w-full items-start gap-2 text-xs'>
            <div className='grid gap-2'>
              <div className='flex items-center gap-2 leading-none font-medium'>
                So với kỳ trước
              </div>
              <div className='flex items-center gap-4'>
                {comparison.avgLevelChange !== null &&
                  comparison.avgLevelChange !== undefined && (
                    <Badge
                      variant='outline'
                      className={
                        comparison.avgLevelChange > 0
                          ? 'border-green-200 text-green-600'
                          : 'border-red-200 text-red-600'
                      }
                    >
                      {comparison.avgLevelChange > 0 ? (
                        <IconTrendingUp className='mr-1 h-3 w-3' />
                      ) : (
                        <IconTrendingDown className='mr-1 h-3 w-3' />
                      )}
                      Mực TB: {Math.abs(comparison.avgLevelChange)}%
                    </Badge>
                  )}
                {comparison.floodHoursChange !== null &&
                  comparison.floodHoursChange !== undefined && (
                    <Badge
                      variant='outline'
                      className={
                        comparison.floodHoursChange < 0
                          ? 'border-green-200 text-green-600'
                          : 'border-red-200 text-red-600'
                      }
                    >
                      {comparison.floodHoursChange < 0 ? (
                        <IconTrendingDown className='mr-1 h-3 w-3' />
                      ) : (
                        <IconTrendingUp className='mr-1 h-3 w-3' />
                      )}
                      Giờ ngập: {Math.abs(comparison.floodHoursChange)}%
                    </Badge>
                  )}
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
