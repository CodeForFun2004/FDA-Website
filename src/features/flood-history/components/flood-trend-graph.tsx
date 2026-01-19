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
import { FloodTrendDto } from '../mock';

interface FloodTrendGraphProps {
  trendData: FloodTrendDto | null;
  isLoading?: boolean;
}

export function FloodTrendGraph({
  trendData,
  isLoading
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
      label: 'Average Water Level (cm)',
      color: 'var(--primary)'
    },
    maxLevel: {
      label: 'Max Water Level (cm)',
      color: 'var(--primary)'
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
          <div className='bg-muted aspect-auto h-[250px] w-full animate-pulse rounded'></div>
        </CardContent>
      </Card>
    );
  }

  if (!trendData || !chartData.length) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Flood Trend Analysis</CardTitle>
          <CardDescription>No trend data available</CardDescription>
        </CardHeader>
        <CardContent className='text-muted-foreground flex h-[250px] items-center justify-center'>
          No data to display
        </CardContent>
      </Card>
    );
  }

  const { comparison } = trendData;
  const hasComparison =
    comparison && (comparison.avgLevelChange || comparison.floodHoursChange);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Flood Trend Analysis</CardTitle>
        <CardDescription>
          {trendData.stationName} -{' '}
          {trendData.period.replace(/([A-Z])/g, ' $1').toLowerCase()}
          {trendData.granularity && ` (${trendData.granularity})`}
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
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
                  labelFormatter={(value) => `Period: ${value}`}
                  formatter={(value, name) => [
                    `${value} cm`,
                    name === 'avgLevel' ? 'Average Level' : 'Max Level'
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
        <CardFooter>
          <div className='flex w-full items-start gap-2 text-sm'>
            <div className='grid gap-2'>
              <div className='flex items-center gap-2 leading-none font-medium'>
                Comparison with previous period
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
                      Avg Level: {Math.abs(comparison.avgLevelChange)}%
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
                      Flood Hours: {Math.abs(comparison.floodHoursChange)}%
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
