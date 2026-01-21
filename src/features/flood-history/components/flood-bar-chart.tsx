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
      label: 'Max Water Level (cm)',
      color: 'hsl(var(--destructive))'
    },
    avgLevel: {
      label: 'Avg Water Level (cm)',
      color: 'hsl(var(--primary))'
    },
    minLevel: {
      label: 'Min Water Level (cm)',
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
          <div className='bg-muted aspect-auto h-[350px] w-full animate-pulse rounded'></div>
        </CardContent>
      </Card>
    );
  }

  if (!trendData || !chartData.length) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>30-Day Flood Analysis</CardTitle>
          <CardDescription>No bar chart data available</CardDescription>
        </CardHeader>
        <CardContent className='text-muted-foreground flex h-[350px] items-center justify-center'>
          No data to display
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>30-Day Flood Analysis</CardTitle>
        <CardDescription>
          {trendData.stationName} - Daily water level ranges and flood hours
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[350px] w-full'
        >
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
                  labelFormatter={(value) => `Date: ${value}`}
                  formatter={(value, name) => [
                    `${value} cm`,
                    name === 'maxLevel'
                      ? 'Maximum Level'
                      : name === 'avgLevel'
                        ? 'Average Level'
                        : 'Minimum Level'
                  ]}
                />
              }
            />
            <Bar
              dataKey='maxLevel'
              fill='var(--color-maxLevel)'
              radius={[2, 2, 0, 0]}
              name='Max Level'
            />
            <Bar
              dataKey='avgLevel'
              fill='var(--color-avgLevel)'
              radius={[2, 2, 0, 0]}
              name='Avg Level'
            />
          </BarChart>
        </ChartContainer>

        {/* Flood Hours Indicator */}
        <div className='mt-4 grid grid-cols-1 gap-2 md:grid-cols-3'>
          {chartData.slice(-3).map((day, index) => (
            <div
              key={day.period}
              className='flex items-center justify-between rounded-lg border p-3'
            >
              <div>
                <div className='text-sm font-medium'>{day.date}</div>
                <div className='text-muted-foreground text-xs'>
                  Max: {day.maxLevel}cm
                </div>
              </div>
              <div className='text-right'>
                <div
                  className={`text-sm font-bold ${
                    day.floodHours > 12
                      ? 'text-red-600'
                      : day.floodHours > 6
                        ? 'text-orange-600'
                        : day.floodHours > 0
                          ? 'text-yellow-600'
                          : 'text-green-600'
                  }`}
                >
                  {day.floodHours}h
                </div>
                <div className='text-muted-foreground text-xs'>flood</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
