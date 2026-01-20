'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { IconMapPin } from '@tabler/icons-react';
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
import { FloodHeatmap } from '@/features/flood-history/components/flood-heatmap';
import { FloodBarChart } from '@/features/flood-history/components/flood-bar-chart';
import { cn } from '@/lib/utils';
import { useFloodStationsStore } from '@/features/zones/store/flood-stations-store';
import { mockAreas } from '@/features/flood-history/mock';
import type {
  HistoryGranularity,
  PeriodPreset,
  TrendsGranularity,
  UUID
} from '@/features/flood-history/types/flood-history.type';
import { useFloodHistoryStore } from '@/features/flood-history/store/flood-history-store';

export type ViewMode = 'trend' | 'detailed-history';

export interface FloodFilterState {
  stationId: UUID | null;
  stationIds: UUID[];
  compare: boolean;
  period: PeriodPreset;
  viewMode: ViewMode;
  compareWithPrevious: boolean;
  selectedAreaId: UUID | null;
}

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

const getDateRangeFromPeriod = (period: PeriodPreset) => {
  const endDate = new Date();
  const startDate = new Date(endDate);

  switch (period) {
    case 'last24hours':
      startDate.setHours(endDate.getHours() - 24);
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

export default function FloodHistoryPage() {
  const searchParams = useSearchParams();
  // Initialize with default values
  const [filters, setFilters] = useState<FloodFilterState>({
    stationId: null,
    stationIds: [],
    compare: false,
    period: 'last30days' as PeriodPreset,
    viewMode: 'trend' as ViewMode,
    compareWithPrevious: false,
    selectedAreaId: mockAreas[0]?.id ?? null
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
    fetchStatistics
  } = useFloodHistoryStore();

  const stationIdsList = useMemo(
    () => floodStations.map((station) => station.stationId),
    [floodStations]
  );

  useEffect(() => {
    if (stationsStatus === 'idle') {
      fetchStations().catch(() => undefined);
    }
  }, [fetchStations, stationsStatus]);

  useEffect(() => {
    if (!floodStations.length) return;

    setFilters((prev) => {
      const preferredStationId =
        prev.stationId && stationIdsList.includes(prev.stationId)
          ? prev.stationId
          : floodStations[0].stationId;

      const nextStationIds = prev.stationIds.filter((id) =>
        stationIdsList.includes(id)
      );

      const normalizedStationIds =
        nextStationIds.length > 0 ? nextStationIds : [preferredStationId];

      if (
        prev.stationId === preferredStationId &&
        prev.stationIds.length === normalizedStationIds.length &&
        prev.stationIds.every((id) => normalizedStationIds.includes(id))
      ) {
        return prev;
      }

      return {
        ...prev,
        stationId: preferredStationId,
        stationIds: normalizedStationIds
      };
    });
  }, [floodStations, stationIdsList]);

  useEffect(() => {
    const stationIdParam = searchParams.get('stationId');
    if (!stationIdParam || !floodStations.length) return;

    const exists = floodStations.some(
      (station) => station.stationId === stationIdParam
    );
    if (!exists) return;

    setFilters((prev) => {
      if (
        prev.stationId === stationIdParam &&
        prev.stationIds.includes(stationIdParam)
      ) {
        return prev;
      }
      return {
        ...prev,
        stationId: stationIdParam,
        stationIds: [stationIdParam],
        compare: false,
        viewMode: prev.viewMode === 'trend' ? 'trend' : 'detailed-history'
      };
    });
  }, [floodStations, searchParams]);

  const loadData = useCallback(async () => {
    if (!filters.stationId && !filters.stationIds.length) return;

    setIsLoading(true);
    try {
      if (filters.viewMode === 'trend') {
        // Load trend data (single station only)
        if (!filters.stationId) return;
        await fetchTrends({
          stationId: filters.stationId,
          period: filters.period,
          granularity: getGranularityFromPeriod(filters.period),
          compareWithPrevious: filters.compareWithPrevious
        });
      } else {
        // Load history data (single or compare)
        const stationIds =
          filters.stationIds.length > 0
            ? filters.stationIds
            : filters.stationId
              ? [filters.stationId]
              : [];
        if (!stationIds.length) return;

        const dateRange = getDateRangeFromPeriod(filters.period);
        const historyArgs = filters.compare
          ? { stationIds }
          : { stationId: filters.stationId };

        await fetchHistory({
          ...historyArgs,
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate,
          granularity: filters.period === 'last24hours' ? 'hourly' : 'daily'
        });
      }

      // Load statistics
      const statsStationIds =
        filters.stationIds.length > 0
          ? filters.stationIds
          : filters.stationId
            ? [filters.stationId]
            : [];
      if (!statsStationIds.length) return;

      const statsArgs = filters.compare
        ? { stationIds: statsStationIds }
        : { stationId: filters.stationId };

      await fetchStatistics({
        ...statsArgs,
        period: filters.period,
        includeBreakdown: true
      });
    } catch (error) {
      console.error('Error loading flood data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchHistory, fetchStatistics, fetchTrends, filters]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApplyFilters = () => {
    loadData();
  };

  const getChartType = () => {
    if (filters.compare) return 'comparison';

    switch (filters.period) {
      case 'last24hours':
        return filters.viewMode === 'detailed-history'
          ? 'line-history'
          : 'line-trend';
      case 'last7days':
        return filters.viewMode === 'detailed-history'
          ? 'line-history'
          : 'line-trend';
      case 'last30days':
        return filters.viewMode === 'detailed-history'
          ? 'line-history'
          : 'bar-chart';
      case 'last90days':
        return 'line-trend';
      case 'last365days':
        return 'heatmap';
      default:
        return 'line-trend';
    }
  };

  const chartType = getChartType();
  // Get stations for selected area
  const areas = useMemo(() => {
    const knownIds = new Set(mockAreas.flatMap((area) => area.stationIds));
    const unmatchedIds = floodStations
      .map((station) => station.stationId)
      .filter((id) => !knownIds.has(id));

    if (!unmatchedIds.length) return mockAreas;

    return [
      ...mockAreas,
      {
        id: 'other-stations',
        name: 'Other Stations',
        stationIds: unmatchedIds
      }
    ];
  }, [floodStations]);

  const getStationsForArea = (areaId: UUID | null) => {
    if (!areaId) return floodStations;
    const area = areas.find((item) => item.id === areaId);
    if (!area) return floodStations;
    return floodStations.filter((station) =>
      area.stationIds.includes(station.stationId)
    );
  };

  const selectedArea = useMemo(() => {
    const area =
      areas.find((item) => item.id === filters.selectedAreaId) ||
      areas[0] ||
      null;
    return area;
  }, [areas, filters.selectedAreaId]);

  const areaStations = useMemo(() => {
    const stations = getStationsForArea(filters.selectedAreaId);
    return stations;
  }, [filters.selectedAreaId, floodStations]);

  const selectedAreaStationCount = selectedArea
    ? areaStations.length
    : floodStations.length;

  const showTrendGraph = chartType === 'line-trend';
  const showHistoryGraph = chartType === 'line-history';
  const showBarChart = chartType === 'bar-chart';
  const showHeatmap = chartType === 'heatmap';
  const showComparison = chartType === 'comparison';
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

  const handleAreaClick = (areaId: UUID) => {
    const areaStations = getStationsForArea(areaId);
    const defaultStationId =
      areaStations[0]?.stationId ?? floodStations[0]?.stationId ?? null;
    setFilters((prevFilters) => ({
      ...prevFilters,
      selectedAreaId: areaId,
      stationId: defaultStationId,
      stationIds: defaultStationId ? [defaultStationId] : []
    }));
  };

  const getStationStatus = (stationId: UUID) => {
    const station = floodStations.find((s) => s.stationId === stationId);
    const stats = statistics.find((s) => s.stationId === stationId);

    // First check station status from backend data
    const rawStatus = station?.stationStatus?.toLowerCase();
    if (rawStatus === 'offline') {
      return { status: 'Offline', variant: 'destructive' as const };
    }
    if (rawStatus === 'maintenance') {
      return { status: 'Maintenance', variant: 'secondary' as const };
    }
    if (rawStatus === 'active') {
      return { status: 'Active', variant: 'default' as const };
    }

    // Fallback to data quality completeness if status missing
    const completeness = stats?.dataQuality?.completeness ?? null;
    if (completeness !== null) {
      if (completeness >= 95)
        return { status: 'Excellent', variant: 'default' as const };
      if (completeness >= 85)
        return { status: 'Good', variant: 'secondary' as const };
      return { status: 'Fair', variant: 'outline' as const };
    }

    return {
      status: station?.stationStatus ?? 'Unknown',
      variant: 'secondary' as const
    };
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
        {/* LEFT COLUMN: Area Tabs + Station List + Analysis Options */}
        <div className='space-y-4 lg:col-span-1'>
          {/* Area Selection - Enhanced Visual Emphasis */}
          <div className='space-y-4'>
            {/* Header with Area Count */}
            <div className='flex items-center justify-between px-1'>
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20'>
                  <IconMapPin className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                </div>
                <div>
                  <h2 className='text-lg font-semibold'>Area Selection</h2>
                  <p className='text-muted-foreground text-sm'>
                    Choose monitoring area • {areas.length} available areas
                  </p>
                </div>
              </div>
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

            {/* Enhanced Area Dropdown */}
            <div className='px-1'>
              <div className='relative'>
                <Select
                  value={filters.selectedAreaId || areas[0]?.id}
                  onValueChange={(value) => handleAreaClick(value)}
                >
                  <SelectTrigger className='h-auto w-full border-2 border-blue-200 bg-blue-50/50 px-4 py-[20px] shadow-sm transition-all duration-200 hover:bg-blue-100/50 dark:border-blue-800 dark:bg-blue-950/20 dark:hover:bg-blue-950/30'>
                    <SelectValue placeholder='Select monitoring area'>
                      {selectedArea && (
                        <div className='flex items-center gap-3'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40'>
                            <IconMapPin className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                          </div>
                          <div className='flex flex-col items-start'>
                            <span className='text-foreground font-semibold'>
                              {selectedArea.name}
                            </span>
                            <span className='text-muted-foreground text-xs'>
                              {selectedAreaStationCount} monitoring stations
                            </span>
                          </div>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className='border-2 border-blue-200 dark:border-blue-800'>
                    {areas.map((area) => {
                      const count = getStationsForArea(area.id).length;
                      return (
                        <SelectItem
                          key={area.id}
                          value={area.id}
                          className='cursor-pointer px-4 py-[25px] hover:bg-blue-50 dark:hover:bg-blue-950/20'
                        >
                          <div className='flex w-full items-center justify-between'>
                            <div className='flex items-center gap-3'>
                              <div className='flex h-6 w-6 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/40'>
                                <IconMapPin className='h-3 w-3 text-blue-600 dark:text-blue-400' />
                              </div>
                              <span className='font-medium'>{area.name}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <span className='text-muted-foreground text-xs'>
                                {count} stations
                              </span>
                              {filters.selectedAreaId === area.id && (
                                <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Station List */}
          <div className='space-y-3'>
            <div className='px-1'>
              <h3 className='text-sm font-medium'>
                Stations in {selectedArea?.name} ({areaStations.length})
              </h3>
            </div>

            <div className='grid max-h-[300px] gap-2 overflow-y-auto pr-1'>
              {areaStations.map((station) => {
                const isSelected = filters.compare
                  ? filters.stationIds.includes(station.stationId)
                  : filters.stationId === station.stationId;
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
                            Quality:{' '}
                            {completeness !== null
                              ? `${completeness.toFixed(0)}%`
                              : 'N/A'}
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

          {showBarChart && (
            <FloodBarChart trendData={trendData} isLoading={isLoading} />
          )}

          {showHeatmap && (
            <FloodHeatmap trendData={trendData} isLoading={isLoading} />
          )}

          {showComparison && (
            <FloodHistoryGraph
              historyData={historyData}
              isLoading={isLoading}
              isCompareMode={true}
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
