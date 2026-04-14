'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  IconDroplet,
  IconRefresh,
  IconChartLine,
  IconClockHour3,
  IconAlertTriangle
} from '@tabler/icons-react';
import { FloodTrendGraph } from '@/features/flood-history/components/flood-trend-graph';
import { FloodHistoryGraph } from '@/features/flood-history/components/flood-history-graph';
import { FloodHeatmap } from '@/features/flood-history/components/flood-heatmap';
import { FloodBarChart } from '@/features/flood-history/components/flood-bar-chart';
import { cn } from '@/libs/utils';
import { useFloodStationsStore } from '@/features/zones/store/flood-stations-store';
import type {
  HistoryGranularity,
  PeriodPreset,
  UUID
} from '@/features/flood-history/types/flood-history.type';
import { useFloodHistoryStore } from '@/features/flood-history/store/flood-history-store';
import {
  FLOOD_ANALYSIS_PANEL_CLASS,
  FLOOD_ANALYSIS_PANEL_SCROLL_CLASS,
  FLOOD_KPI_STRIP_CLASS
} from '@/features/flood-history/constants/flood-chart-layout';

const FLOOD_HISTORY_PAGE_LIMIT = 2000;

export interface FloodFilterState {
  stationId: UUID | null;
  period: PeriodPreset;
}

function isHourWindowPeriod(period: PeriodPreset): boolean {
  return (
    period === 'last6hours' ||
    period === 'last12hours' ||
    period === 'last24hours'
  );
}

const getDateRangeFromPeriod = (period: PeriodPreset) => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  const hourMs = 60 * 60 * 1000;

  switch (period) {
    case 'last6hours':
      startDate.setTime(endDate.getTime() - 6 * hourMs);
      break;
    case 'last12hours':
      startDate.setTime(endDate.getTime() - 12 * hourMs);
      break;
    case 'last24hours':
      startDate.setTime(endDate.getTime() - 24 * hourMs);
      break;
    case 'last7days':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'last30days':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case 'last90days':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case 'last365days':
      startDate.setDate(endDate.getDate() - 365);
      break;
    default:
      return null;
  }

  return { startDate, endDate };
};

function historyGranularityForPeriod(period: PeriodPreset): HistoryGranularity {
  return isHourWindowPeriod(period) ? 'hourly' : 'daily';
}

/**
 * flood-trends trên UAT hay 400 nếu thêm granularity/custom — chỉ gọi khi không phải preset giờ,
 * và chỉ truyền stationId + period (BE tự default).
 */
function shouldFetchTrends(period: PeriodPreset): boolean {
  return !isHourWindowPeriod(period);
}

export default function FloodHistoryPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FloodFilterState>({
    stationId: null,
    period: 'last30days' as PeriodPreset
  });

  const [isLoading, setIsLoading] = useState(false);
  const {
    stations: floodStations,
    status: stationsStatus,
    fetchStations
  } = useFloodStationsStore();
  const {
    trendData,
    historyData,
    statistics,
    fetchTrends,
    fetchHistory,
    fetchStatistics,
    clearStatistics
  } = useFloodHistoryStore();

  const stationList = useMemo(
    () =>
      [...floodStations].sort((a, b) =>
        a.stationName.localeCompare(b.stationName, 'vi')
      ),
    [floodStations]
  );

  useEffect(() => {
    if (stationsStatus === 'idle') {
      fetchStations().catch(() => undefined);
    }
  }, [fetchStations, stationsStatus]);

  useEffect(() => {
    if (!stationList.length) return;
    setFilters((prev) => {
      if (
        prev.stationId &&
        stationList.some((s) => s.stationId === prev.stationId)
      ) {
        return prev;
      }
      return { ...prev, stationId: stationList[0]!.stationId };
    });
  }, [stationList]);

  useEffect(() => {
    const stationIdParam = searchParams.get('stationId');
    if (!stationIdParam || !stationList.length) return;
    if (!stationList.some((s) => s.stationId === stationIdParam)) return;

    setFilters((prev) => {
      if (prev.stationId === stationIdParam) return prev;
      return {
        ...prev,
        stationId: stationIdParam
      };
    });
  }, [stationList, searchParams]);

  const areaIdForSelectedStation = useMemo(() => {
    if (!filters.stationId) return undefined;
    const s = floodStations.find((x) => x.stationId === filters.stationId);
    const aid = s?.administrativeAreaId;
    return aid && String(aid).trim() !== '' ? aid : undefined;
  }, [filters.stationId, floodStations]);

  const statsForSelectedStation = useMemo(() => {
    if (!filters.stationId) return null;
    return (
      statistics.find((s) => s.stationId === filters.stationId) ??
      statistics[0] ??
      null
    );
  }, [statistics, filters.stationId]);

  const loadData = useCallback(async () => {
    if (!filters.stationId) return;

    setIsLoading(true);
    try {
      const dateRange = getDateRangeFromPeriod(filters.period);
      const hour = isHourWindowPeriod(filters.period);

      if (hour) {
        clearStatistics();
      }

      if (shouldFetchTrends(filters.period)) {
        await fetchTrends({
          stationId: filters.stationId,
          period: filters.period
        });
      }

      await fetchHistory({
        stationId: filters.stationId,
        ...(areaIdForSelectedStation
          ? { areaId: areaIdForSelectedStation }
          : {}),
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate,
        granularity: historyGranularityForPeriod(filters.period),
        limit: FLOOD_HISTORY_PAGE_LIMIT
      });

      if (!hour) {
        await fetchStatistics({
          stationId: filters.stationId,
          ...(areaIdForSelectedStation
            ? { areaId: areaIdForSelectedStation }
            : {}),
          period: filters.period,
          includeBreakdown: true
        });
      }
    } catch (error) {
      console.error('Error loading flood data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchHistory,
    fetchStatistics,
    fetchTrends,
    clearStatistics,
    filters,
    areaIdForSelectedStation
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApplyFilters = () => {
    loadData();
  };

  const hourPreset = isHourWindowPeriod(filters.period);

  const getChartType = () => {
    if (hourPreset) return 'line-history';
    switch (filters.period) {
      case 'last30days':
        return 'bar-chart';
      case 'last365days':
        return 'heatmap';
      default:
        return 'line-trend';
    }
  };

  const chartType = getChartType();

  const showTrendGraph = chartType === 'line-trend' && !hourPreset;
  const showHistoryGraph = chartType === 'line-history' || hourPreset;
  const showBarChart = chartType === 'bar-chart' && !hourPreset;
  const showHeatmap = chartType === 'heatmap' && !hourPreset;

  const handleStationClick = (stationId: UUID) => {
    setFilters((prev) => ({ ...prev, stationId }));
  };

  const getStationStatus = (stationId: UUID) => {
    const station = floodStations.find((s) => s.stationId === stationId);
    const stats = statistics.find((s) => s.stationId === stationId);

    const rawStatus = station?.stationStatus?.toLowerCase();
    if (rawStatus === 'offline') {
      return { status: 'Mất kết nối', variant: 'destructive' as const };
    }
    if (rawStatus === 'maintenance') {
      return { status: 'Bảo trì', variant: 'secondary' as const };
    }
    if (rawStatus === 'online' || rawStatus === 'active') {
      return { status: 'Hoạt động', variant: 'default' as const };
    }

    const completeness = stats?.dataQuality?.completeness ?? null;
    if (completeness !== null) {
      if (completeness >= 95)
        return { status: 'Rất tốt', variant: 'default' as const };
      if (completeness >= 85)
        return { status: 'Tốt', variant: 'secondary' as const };
      return { status: 'Trung bình', variant: 'outline' as const };
    }

    return {
      status: station?.stationStatus ?? 'Chưa rõ',
      variant: 'secondary' as const
    };
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Lịch sử ngập & xu hướng
          </h1>
          <p className='text-muted-foreground mt-1'>
            Xem mực nước và xu hướng theo trạm và khoảng thời gian đã chọn.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={handleApplyFilters}>
            <IconRefresh className='mr-2 h-4 w-4' /> Làm mới
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='space-y-4 lg:col-span-1'>
          <div className='space-y-4'>
            <div className='flex items-center gap-3 px-1'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20'>
                <IconDroplet className='h-4 w-4 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <h2 className='text-lg font-semibold'>Trạm quan trắc</h2>
                <p className='text-muted-foreground text-sm'>
                  {stationList.length} trạm
                </p>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='px-1'>
                <h3 className='text-sm font-medium'>Danh sách trạm</h3>
              </div>

              <div className='grid max-h-[360px] gap-2 overflow-y-auto pr-1'>
                {stationList.map((station) => {
                  const isSelected = filters.stationId === station.stationId;
                  const statusInfo = getStationStatus(station.stationId);
                  const completeness =
                    statistics.find((s) => s.stationId === station.stationId)
                      ?.dataQuality?.completeness ?? null;

                  return (
                    <div
                      key={station.stationId}
                      onClick={() => handleStationClick(station.stationId)}
                      className={cn(
                        'group cursor-pointer rounded-lg border p-3 transition-all hover:border-blue-300 hover:shadow-sm',
                        isSelected
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:bg-blue-900/20'
                          : 'bg-card hover:bg-accent/50'
                      )}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <div
                            className={cn(
                              'rounded-md p-1.5',
                              isSelected
                                ? 'bg-blue-200 text-blue-700'
                                : 'bg-slate-100 text-slate-500'
                            )}
                          >
                            <IconDroplet className='h-3.5 w-3.5' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <h4 className='truncate text-xs font-bold'>
                              {station.stationName}
                            </h4>
                            <p className='text-muted-foreground truncate text-[10px]'>
                              {station.stationCode}
                            </p>
                            {station.locationDesc && (
                              <p className='text-muted-foreground mt-0.5 truncate text-[9px]'>
                                {station.locationDesc}
                              </p>
                            )}
                            <p className='text-muted-foreground mt-0.5 text-[9px]'>
                              Chất lượng:{' '}
                              {completeness !== null
                                ? `${completeness.toFixed(0)}%`
                                : '—'}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={statusInfo.variant}
                          className='h-5 text-[10px]'
                        >
                          {statusInfo.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <Card className='bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm'>
                <IconChartLine className='h-3.5 w-3.5' />
                Khoảng thời gian
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2.5'>
              <div className='space-y-1'>
                <Label className='text-muted-foreground text-[10px] font-medium'>
                  Khung thời gian
                </Label>
                <Select
                  value={filters.period}
                  onValueChange={(value) =>
                    setFilters({ ...filters, period: value as PeriodPreset })
                  }
                >
                  <SelectTrigger className='h-8 text-xs'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='last6hours' className='text-xs'>
                      6 giờ gần nhất
                    </SelectItem>
                    <SelectItem value='last12hours' className='text-xs'>
                      12 giờ gần nhất
                    </SelectItem>
                    <SelectItem value='last24hours' className='text-xs'>
                      24 giờ gần nhất
                    </SelectItem>
                    <SelectItem value='last7days' className='text-xs'>
                      7 ngày
                    </SelectItem>
                    <SelectItem value='last30days' className='text-xs'>
                      30 ngày
                    </SelectItem>
                    <SelectItem value='last90days' className='text-xs'>
                      90 ngày
                    </SelectItem>
                    <SelectItem value='last365days' className='text-xs'>
                      365 ngày
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='flex min-h-0 flex-col gap-4 lg:col-span-2'>
          <div className={FLOOD_KPI_STRIP_CLASS}>
            <div className='bg-card rounded-lg border p-3'>
              <div className='mb-1 flex items-center gap-2'>
                <IconDroplet className='h-3.5 w-3.5 text-blue-600' />
                <span className='text-muted-foreground text-[10px]'>
                  Mực max
                </span>
              </div>
              <div className='text-lg font-bold text-blue-600'>
                {statsForSelectedStation
                  ? statsForSelectedStation.summary.maxWaterLevel.toFixed(1)
                  : '—'}
                <span className='text-muted-foreground ml-1 text-xs'>cm</span>
              </div>
            </div>
            <div className='bg-card rounded-lg border p-3'>
              <div className='mb-1 flex items-center gap-2'>
                <IconChartLine className='h-3.5 w-3.5 text-blue-500' />
                <span className='text-muted-foreground text-[10px]'>
                  Mực TB
                </span>
              </div>
              <div className='text-lg font-bold text-blue-500'>
                {statsForSelectedStation
                  ? statsForSelectedStation.summary.avgWaterLevel.toFixed(1)
                  : '—'}
                <span className='text-muted-foreground ml-1 text-xs'>cm</span>
              </div>
            </div>
            <div className='bg-card rounded-lg border p-3'>
              <div className='mb-1 flex items-center gap-2'>
                <IconClockHour3 className='h-3.5 w-3.5 text-orange-600' />
                <span className='text-muted-foreground text-[10px]'>
                  Giờ ngập
                </span>
              </div>
              <div className='text-lg font-bold text-orange-600'>
                {statsForSelectedStation
                  ? statsForSelectedStation.summary.totalFloodHours
                  : '—'}
                <span className='text-muted-foreground ml-1 text-xs'>h</span>
              </div>
            </div>
            <div className='bg-card rounded-lg border p-3'>
              <div className='mb-1 flex items-center gap-2'>
                <IconAlertTriangle className='h-3.5 w-3.5 text-green-600' />
                <span className='text-muted-foreground text-[10px]'>
                  Chất lượng
                </span>
              </div>
              <div className='text-lg font-bold text-green-600'>
                {statsForSelectedStation?.dataQuality?.completeness != null
                  ? `${statsForSelectedStation.dataQuality.completeness.toFixed(0)}%`
                  : '—'}
              </div>
            </div>
          </div>

          <div className={FLOOD_ANALYSIS_PANEL_CLASS}>
            <div className={FLOOD_ANALYSIS_PANEL_SCROLL_CLASS}>
              {showTrendGraph && (
                <FloodTrendGraph trendData={trendData} isLoading={isLoading} />
              )}

              {showHistoryGraph && (
                <FloodHistoryGraph
                  historyData={historyData}
                  isLoading={isLoading}
                  isCompareMode={false}
                />
              )}

              {showBarChart && (
                <FloodBarChart trendData={trendData} isLoading={isLoading} />
              )}

              {showHeatmap && (
                <FloodHeatmap trendData={trendData} isLoading={isLoading} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
