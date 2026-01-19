'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
import { FloodKpiCards } from '@/features/flood-history/components/flood-kpi-cards';
import { FloodTrendGraph } from '@/features/flood-history/components/flood-trend-graph';
import { FloodHistoryGraph } from '@/features/flood-history/components/flood-history-graph';
import { FloodDataQuality } from '@/features/flood-history/components/flood-data-quality';
import { cn } from '@/lib/utils';
import {
  getMockFloodTrends,
  getMockFloodHistory,
  getMockFloodStatistics,
  mockStations,
  PeriodPreset,
  TrendsGranularity,
  HistoryGranularity,
  FloodTrendDto,
  FloodHistoryDto,
  FloodStatisticsDto,
  UUID
} from '@/features/flood-history/mock';

export type ViewMode = 'trend' | 'detailed-history';

export interface FloodFilterState {
  stationId: UUID;
  stationIds: UUID[];
  compare: boolean;
  period: PeriodPreset;
  viewMode: ViewMode;
  compareWithPrevious: boolean;
}

export default function FloodHistoryPage() {
  // Initialize with default values
  const [filters, setFilters] = useState<FloodFilterState>({
    stationId: mockStations[0].id,
    stationIds: [mockStations[0].id],
    compare: false,
    period: 'last30days' as PeriodPreset,
    viewMode: 'trend' as ViewMode,
    compareWithPrevious: false
  });

  const [trendData, setTrendData] = useState<FloodTrendDto | null>(null);
  const [historyData, setHistoryData] = useState<FloodHistoryDto[]>([]);
  const [statistics, setStatistics] = useState<FloodStatisticsDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (filters.viewMode === 'trend') {
        // Load trend data (single station only)
        const trendResponse = getMockFloodTrends({
          stationId: filters.stationId,
          period: filters.period,
          granularity: filters.period === 'last24hours' ? 'daily' : 'daily',
          compareWithPrevious: filters.compareWithPrevious
        });
        setTrendData(trendResponse.data);
      } else {
        // Load history data (single or compare)
        const historyArgs = filters.compare
          ? { stationIds: filters.stationIds }
          : { stationId: filters.stationId };

        const historyResponse = getMockFloodHistory({
          ...historyArgs,
          granularity: filters.period === 'last24hours' ? 'hourly' : 'daily'
        });
        setHistoryData(
          Array.isArray(historyResponse.data)
            ? historyResponse.data
            : [historyResponse.data]
        );
      }

      // Load statistics
      const statsArgs = filters.compare
        ? { stationIds: filters.stationIds }
        : { stationId: filters.stationId };

      const statsResponse = getMockFloodStatistics({
        ...statsArgs,
        period: filters.period
      });
      setStatistics(
        Array.isArray(statsResponse.data)
          ? statsResponse.data
          : [statsResponse.data]
      );
    } catch (error) {
      console.error('Error loading flood data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApplyFilters = () => {
    loadData();
  };

  const getGranularityFromPeriod = (
    period: PeriodPreset
  ): TrendsGranularity | HistoryGranularity => {
    switch (period) {
      case 'last24hours':
        return 'daily'; // For trends, or 'hourly' for history
      case 'last7days':
        return 'daily';
      case 'last30days':
        return 'daily';
      case 'last90days':
        return 'weekly';
      case 'last365days':
        return 'monthly';
      default:
        return 'daily';
    }
  };

  const showTrendGraph = filters.viewMode === 'trend' || filters.compare;
  const showHistoryGraph =
    filters.viewMode === 'detailed-history' || filters.compare;
  const singleStationStats = statistics.length === 1 ? statistics[0] : null;

  const handleStationClick = (stationId: UUID) => {
    if (filters.compare) {
      const currentIds = filters.stationIds;
      if (currentIds.includes(stationId)) {
        const newIds = currentIds.filter((id) => id !== stationId);
        if (newIds.length > 0) {
          setFilters({ ...filters, stationIds: newIds });
        }
      } else {
        if (currentIds.length < 3) {
          setFilters({ ...filters, stationIds: [...currentIds, stationId] });
        }
      }
    } else {
      setFilters({ ...filters, stationId, stationIds: [stationId] });
    }
  };

  const getStationStatus = (stationId: UUID) => {
    const stats = statistics.find((s) => s.stationId === stationId);
    if (!stats) return { status: 'Unknown', variant: 'secondary' as const };

    const completeness = stats.dataQuality?.completeness ?? 0;
    if (completeness >= 95)
      return { status: 'Excellent', variant: 'default' as const };
    if (completeness >= 85)
      return { status: 'Good', variant: 'secondary' as const };
    return { status: 'Fair', variant: 'outline' as const };
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Flood History & Trends
          </h1>
          <p className='text-muted-foreground mt-1'>
            Analyze flood patterns, water levels, and data quality across
            monitoring stations.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={handleApplyFilters}>
            <IconRefresh className='mr-2 h-4 w-4' /> Refresh Data
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* LEFT COLUMN: Station List + Analysis Options */}
        <div className='space-y-4 lg:col-span-1'>
          {/* Station List */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between px-1'>
              <h2 className='text-lg font-semibold'>
                Monitoring Stations ({mockStations.length})
              </h2>
              <div className='flex items-center gap-2'>
                <Switch
                  id='compare-stations'
                  checked={filters.compare}
                  onCheckedChange={(checked) =>
                    setFilters({
                      ...filters,
                      compare: checked,
                      viewMode: checked ? 'detailed-history' : filters.viewMode
                    })
                  }
                  className='scale-75'
                />
                <Label
                  htmlFor='compare-stations'
                  className='cursor-pointer text-xs'
                >
                  Compare
                </Label>
              </div>
            </div>

            <div className='grid max-h-[350px] gap-2 overflow-y-auto pr-1'>
              {mockStations.map((station) => {
                const isSelected = filters.compare
                  ? filters.stationIds.includes(station.id)
                  : filters.stationId === station.id;
                const statusInfo = getStationStatus(station.id);

                return (
                  <div
                    key={station.id}
                    onClick={() => handleStationClick(station.id)}
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
                        <div>
                          <h4 className='text-xs font-bold'>{station.name}</h4>
                          <p className='text-muted-foreground text-[10px]'>
                            {station.code}
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

          {/* Analysis Options */}
          <Card className='bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm'>
                <IconChartLine className='h-3.5 w-3.5' />
                Analysis Options
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2.5'>
              {/* Period Selection */}
              <div className='space-y-1'>
                <Label className='text-muted-foreground text-[10px] font-medium'>
                  Time Period
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
                    <SelectItem value='last24hours' className='text-xs'>
                      Last 24 Hours
                    </SelectItem>
                    <SelectItem value='last7days' className='text-xs'>
                      Last 7 Days
                    </SelectItem>
                    <SelectItem value='last30days' className='text-xs'>
                      Last 30 Days
                    </SelectItem>
                    <SelectItem value='last90days' className='text-xs'>
                      Last 90 Days
                    </SelectItem>
                    <SelectItem value='last365days' className='text-xs'>
                      Last 365 Days
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode */}
              <div className='space-y-1'>
                <Label className='text-muted-foreground text-[10px] font-medium'>
                  View Mode
                </Label>
                <Select
                  value={filters.viewMode}
                  onValueChange={(value) =>
                    setFilters({ ...filters, viewMode: value as ViewMode })
                  }
                >
                  <SelectTrigger className='h-8 text-xs'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='trend' className='text-xs'>
                      Trend Analysis
                    </SelectItem>
                    <SelectItem value='detailed-history' className='text-xs'>
                      Detailed History
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Compare with Previous */}
              {filters.viewMode === 'trend' && !filters.compare && (
                <div className='space-y-1'>
                  <Label className='text-muted-foreground text-[10px] font-medium'>
                    Comparison
                  </Label>
                  <div className='bg-background flex h-8 items-center rounded-md border px-2'>
                    <Switch
                      id='compare-prev'
                      checked={filters.compareWithPrevious}
                      onCheckedChange={(checked) =>
                        setFilters({ ...filters, compareWithPrevious: checked })
                      }
                      className='scale-75'
                    />
                    <Label
                      htmlFor='compare-prev'
                      className='ml-1 cursor-pointer text-xs'
                    >
                      vs Previous Period
                    </Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Charts with Inline KPIs */}
        <div className='space-y-4 lg:col-span-2'>
          {/* Compact KPI Bar */}
          {statistics.length > 0 && (
            <div className='grid grid-cols-2 gap-2 md:grid-cols-4'>
              <div className='bg-card rounded-lg border p-3'>
                <div className='mb-1 flex items-center gap-2'>
                  <IconDroplet className='h-3.5 w-3.5 text-blue-600' />
                  <span className='text-muted-foreground text-[10px]'>
                    Max Level
                  </span>
                </div>
                <div className='text-lg font-bold text-blue-600'>
                  {statistics[0].summary.maxWaterLevel.toFixed(1)}
                  <span className='text-muted-foreground ml-1 text-xs'>cm</span>
                </div>
              </div>
              <div className='bg-card rounded-lg border p-3'>
                <div className='mb-1 flex items-center gap-2'>
                  <IconChartLine className='h-3.5 w-3.5 text-blue-500' />
                  <span className='text-muted-foreground text-[10px]'>
                    Avg Level
                  </span>
                </div>
                <div className='text-lg font-bold text-blue-500'>
                  {statistics[0].summary.avgWaterLevel.toFixed(1)}
                  <span className='text-muted-foreground ml-1 text-xs'>cm</span>
                </div>
              </div>
              <div className='bg-card rounded-lg border p-3'>
                <div className='mb-1 flex items-center gap-2'>
                  <IconClockHour3 className='h-3.5 w-3.5 text-orange-600' />
                  <span className='text-muted-foreground text-[10px]'>
                    Flood Hours
                  </span>
                </div>
                <div className='text-lg font-bold text-orange-600'>
                  {statistics[0].summary.totalFloodHours}
                  <span className='text-muted-foreground ml-1 text-xs'>h</span>
                </div>
              </div>
              <div className='bg-card rounded-lg border p-3'>
                <div className='mb-1 flex items-center gap-2'>
                  <IconAlertTriangle className='h-3.5 w-3.5 text-green-600' />
                  <span className='text-muted-foreground text-[10px]'>
                    Quality
                  </span>
                </div>
                <div className='text-lg font-bold text-green-600'>
                  {(statistics[0].dataQuality?.completeness ?? 95).toFixed(0)}
                  <span className='text-muted-foreground ml-1 text-xs'>%</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Charts */}
          {showTrendGraph && (
            <FloodTrendGraph trendData={trendData} isLoading={isLoading} />
          )}

          {showHistoryGraph && (
            <FloodHistoryGraph
              historyData={historyData}
              isLoading={isLoading}
              isCompareMode={filters.compare}
            />
          )}

          {/* Data Quality Panel */}
          <FloodDataQuality
            statistics={singleStationStats}
            isCompareMode={filters.compare}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
