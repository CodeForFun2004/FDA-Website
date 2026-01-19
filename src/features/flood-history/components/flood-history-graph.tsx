'use client';

import { useMemo } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';

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
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { FloodHistoryDto } from '../mock';

interface FloodHistoryGraphProps {
  historyData: FloodHistoryDto[];
  isLoading?: boolean;
  isCompareMode?: boolean;
}

export function FloodHistoryGraph({
  historyData,
  isLoading,
  isCompareMode
}: FloodHistoryGraphProps) {
  const { chartData, chartConfig } = useMemo(() => {
    if (!historyData || historyData.length === 0) {
      return { chartData: [], chartConfig: {} as ChartConfig };
    }

    if (isCompareMode && historyData.length > 1) {
      // Compare mode: multiple stations
      const allTimestamps = new Set<string>();
      historyData.forEach((dto) => {
        dto.dataPoints.forEach((point) => allTimestamps.add(point.timestamp));
      });

      const sortedTimestamps = Array.from(allTimestamps).sort();

      const data = sortedTimestamps.map((timestamp) => {
        const entry: any = {
          timestamp,
          date: new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        };

        historyData.forEach((dto) => {
          const point = dto.dataPoints.find((p) => p.timestamp === timestamp);
          entry[`${dto.stationCode}_value`] = point?.value ?? null;
        });

        return entry;
      });

      const config: ChartConfig = {};
      historyData.forEach((dto, index) => {
        const colors = [
          'var(--primary)',
          'hsl(var(--primary) / 0.7)',
          'hsl(var(--primary) / 0.5)'
        ];
        config[`${dto.stationCode}_value`] = {
          label: dto.stationName,
          color: colors[index % colors.length]
        };
      });

      return { chartData: data, chartConfig: config };
    } else {
      // Single station mode
      const dto = historyData[0];
      if (!dto?.dataPoints) {
        return { chartData: [], chartConfig: {} as ChartConfig };
      }

      const data = dto.dataPoints.map((point) => ({
        timestamp: point.timestamp,
        value: point.value,
        date: new Date(point.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }));

      const config: ChartConfig = {
        value: {
          label: 'Water Level (cm)',
          color: 'var(--primary)'
        }
      };

      return { chartData: data, chartConfig: config };
    }
  }, [historyData, isCompareMode]);

  if (isLoading) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <div className='bg-muted h-6 animate-pulse rounded'></div>
          <div className='bg-muted mt-2 h-4 animate-pulse rounded'></div>
        </CardHeader>
        <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
          <div className='bg-muted aspect-auto h-[300px] w-full animate-pulse rounded'></div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData.length) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Flood History</CardTitle>
          <CardDescription>No history data available</CardDescription>
        </CardHeader>
        <CardContent className='text-muted-foreground flex h-[300px] items-center justify-center'>
          No data to display
        </CardContent>
      </Card>
    );
  }

  const title = isCompareMode ? 'Station Comparison' : 'Detailed Flood History';
  const description = isCompareMode
    ? `${historyData.length} stations compared`
    : `${historyData[0]?.stationName} - ${historyData[0]?.metadata.granularity} data`;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[300px] w-full'
        >
          <LineChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
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
              cursor={{
                stroke: 'var(--primary)',
                strokeWidth: 1,
                opacity: 0.5
              }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Time: ${value}`}
                  formatter={(value, name) => {
                    if (value === null || value === undefined)
                      return ['No data', name];
                    return [`${value} cm`, name];
                  }}
                />
              }
            />
            {isCompareMode ? (
              <>
                <ChartLegend content={<ChartLegendContent />} />
                {historyData.map((dto, index) => {
                  const colors = [
                    'var(--primary)',
                    'hsl(var(--primary) / 0.7)',
                    'hsl(var(--primary) / 0.5)'
                  ];
                  return (
                    <Line
                      key={dto.stationId}
                      type='monotone'
                      dataKey={`${dto.stationCode}_value`}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                    />
                  );
                })}
              </>
            ) : (
              <Line
                type='monotone'
                dataKey='value'
                stroke='var(--color-value)'
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
