'use client';

import { useMemo } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { IconAlertTriangle } from '@tabler/icons-react';

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
import { FLOOD_CHART_PLOT_CLASS } from '../constants/flood-chart-layout';
import type { FloodHistoryDto } from '../types/flood-history.type';

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
  const { chartData, chartConfig, missingIntervals } = useMemo(() => {
    if (!historyData || historyData.length === 0) {
      return {
        chartData: [],
        chartConfig: {} as ChartConfig,
        missingIntervals: []
      };
    }

    // Detect missing intervals across all data
    const allTimestamps = new Set<string>();
    historyData.forEach((dto) => {
      dto.dataPoints.forEach((point) => allTimestamps.add(point.timestamp));
    });

    const sortedTimestamps = Array.from(allTimestamps).sort();
    const detectedMissing: Array<{
      start: Date;
      end: Date;
      durationMinutes: number;
    }> = [];

    // Calculate expected interval based on granularity
    const dto = historyData[0];
    const granularity = dto?.metadata?.granularity;
    const expectedIntervalMs =
      granularity === 'hourly' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    for (let i = 1; i < sortedTimestamps.length; i++) {
      const current = new Date(sortedTimestamps[i]);
      const previous = new Date(sortedTimestamps[i - 1]);
      const gap = current.getTime() - previous.getTime();

      if (gap > expectedIntervalMs * 1.5) {
        // 50% tolerance for missing data
        detectedMissing.push({
          start: previous,
          end: current,
          durationMinutes: Math.floor(gap / (60 * 1000))
        });
      }
    }

    if (isCompareMode && historyData.length > 1) {
      // Compare mode: multiple stations
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

      return {
        chartData: data,
        chartConfig: config,
        missingIntervals: detectedMissing
      };
    } else {
      // Single station mode
      const dto = historyData[0];
      if (!dto?.dataPoints) {
        return {
          chartData: [],
          chartConfig: {} as ChartConfig,
          missingIntervals: []
        };
      }

      const data = dto.dataPoints.map((point) => ({
        timestamp: point.timestamp,
        value: point.value,
        severity: point.severity,
        qualityFlag: point.qualityFlag,
        date: new Date(point.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }));

      const config: ChartConfig = {
        value: {
          label: 'Mực nước (cm)',
          color: 'var(--primary)'
        }
      };

      return {
        chartData: data,
        chartConfig: config,
        missingIntervals: detectedMissing
      };
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
          <div
            className={`bg-muted w-full animate-pulse rounded ${FLOOD_CHART_PLOT_CLASS}`}
          />
        </CardContent>
      </Card>
    );
  }

  if (!chartData.length) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Phân tích ngập</CardTitle>
          <CardDescription>Chưa có dữ liệu lịch sử</CardDescription>
        </CardHeader>
        <CardContent
          className={`text-muted-foreground flex items-center justify-center ${FLOOD_CHART_PLOT_CLASS}`}
        >
          Không có dữ liệu
        </CardContent>
      </Card>
    );
  }

  const title = isCompareMode ? 'So sánh trạm' : 'Phân tích ngập';
  const description = isCompareMode
    ? `${historyData.length} stations compared`
    : `${historyData[0]?.stationName} — ${historyData[0]?.metadata.granularity} series`;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer config={chartConfig} className={FLOOD_CHART_PLOT_CLASS}>
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
                  labelFormatter={(value) => `Thời điểm: ${value}`}
                  formatter={(value, name, props) => {
                    if (value === null || value === undefined)
                      return ['Không có dữ liệu', name];

                    const severity = props?.payload?.severity;
                    const qualityFlag = props?.payload?.qualityFlag;

                    return [
                      <div key={name} className='flex flex-col gap-1'>
                        <div>{`${value} cm`}</div>
                        {severity && (
                          <div className='text-xs capitalize opacity-75'>
                            {severity}
                          </div>
                        )}
                        {qualityFlag && qualityFlag !== 'ok' && (
                          <div className='text-xs text-yellow-600'>
                            Chất lượng: {qualityFlag}
                          </div>
                        )}
                      </div>,
                      name
                    ];
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

        {/* Cố định chiều cao — không làm phình card / nhảy layout */}
        {missingIntervals.length > 0 && (
          <div className='mt-3 max-h-[88px] shrink-0 overflow-y-auto rounded-lg border border-orange-200 bg-orange-50 p-2 dark:border-orange-800 dark:bg-orange-950/20'>
            <div className='flex items-center gap-2 text-xs font-medium text-orange-800 dark:text-orange-200'>
              <IconAlertTriangle className='h-3.5 w-3.5 shrink-0' />
              Thiếu dữ liệu ({missingIntervals.length})
            </div>
            <div className='mt-1 text-[10px] text-orange-700 dark:text-orange-300'>
              Khoảng ngắn hơn thường đủ điểm đo hơn.
            </div>
            <div className='mt-1 space-y-0.5'>
              {missingIntervals.slice(0, 3).map((interval, index) => (
                <div
                  key={index}
                  className='text-[10px] text-orange-600 dark:text-orange-400'
                >
                  {interval.start.toLocaleString('vi-VN')} →{' '}
                  {interval.end.toLocaleString('vi-VN')} (
                  {interval.durationMinutes} phút)
                </div>
              ))}
              {missingIntervals.length > 3 && (
                <div className='text-[10px] text-orange-500'>
                  +{missingIntervals.length - 3} mục nữa
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
