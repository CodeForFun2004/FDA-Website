'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchAllAdministrativeAreasForSelect } from '@/features/admin/api/admin.api';
import { getAccessToken } from '@/libs/auth-utils';
import {
  AnalyticsApiError,
  analyticsApi,
  HOTSPOT_RANKINGS_AREA_LEVEL
} from '@/features/analytics/api/analytics.api';
import QuickActionModal from '@/features/analytics/components/QuickActionModal';
import type {
  AdministrativeArea,
  FrequencyAggregationRequest,
  HotspotAggregationRequest,
  SeverityAggregationRequest
} from '@/features/analytics/types/analytics.types';
import type {
  FrequencyAnalyticsResponse,
  HotspotRankingsResponse
} from '@/features/analytics/types/analytics.dashboard.types';
import type { SeverityAnalyticsResponse } from '@/features/analytics/types/analytics.dashboard.types';
import { AnalyticsHeader } from '@/features/analytics/components/dashboard/AnalyticsHeader';
import {
  AnalyticsFilters,
  type AnalyticsFiltersState
} from '@/features/analytics/components/dashboard/AnalyticsFilters';
import { FrequencyChartCard } from '@/features/analytics/components/dashboard/FrequencyChartCard';
import { SeverityChartCard } from '@/features/analytics/components/dashboard/SeverityChartCard';
import { HotspotRankingCard } from '@/features/analytics/components/dashboard/HotspotRankingCard';
import { AnalyticsTrendPointsTable } from '@/features/analytics/components/dashboard/analytics-trend-points-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { addDays, format } from 'date-fns';

const HOTSPOT_TOPN_MIN = 1;
const HOTSPOT_TOPN_MAX = 200;

function mapAreasForModal(
  rows: {
    id: string;
    name: string;
    level: string;
    parentId: string | null;
    code: string;
    geometry: string | null;
  }[]
): AdministrativeArea[] {
  return rows.map((a) => ({
    id: a.id,
    name: a.name,
    level: a.level,
    parentId: a.parentId ?? undefined,
    code: a.code,
    geometry: a.geometry
  }));
}

function clampHotspotTopN(n: number) {
  return Math.min(
    HOTSPOT_TOPN_MAX,
    Math.max(HOTSPOT_TOPN_MIN, Math.floor(Number(n)) || HOTSPOT_TOPN_MIN)
  );
}

type TriggerType = 'frequency' | 'severity' | 'hotspots';

function today() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function AnalyticsDashboard() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [quickActionType, setQuickActionType] =
    React.useState<TriggerType | null>(null);

  const [filters, setFilters] = React.useState<AnalyticsFiltersState>(() => ({
    metric: 'all',
    bucketType: 'day',
    startDate: today(),
    endDate: format(addDays(new Date(), 6), 'yyyy-MM-dd'),
    areaId: 'all',
    topN: 50
  }));
  const [applied, setApplied] = React.useState(filters);
  const applyFilters = React.useCallback((next: AnalyticsFiltersState) => {
    setApplied(next);
    toast.message('Đã áp dụng bộ lọc');
  }, []);

  const { data: areasRows = [], isLoading: areasLoading } = useQuery({
    queryKey: ['administrative-areas', 'analytics', 'street'],
    queryFn: () => fetchAllAdministrativeAreasForSelect({ level: 'street' }),
    staleTime: 5 * 60 * 1000
  });

  const areas = React.useMemo(() => mapAreasForModal(areasRows), [areasRows]);

  const hotspotRankTopN = clampHotspotTopN(applied.topN);

  const fetchHotspots =
    applied.metric === 'all' || applied.metric === 'hotspots';

  const hotspotQuery = useQuery<HotspotRankingsResponse | null>({
    enabled: fetchHotspots,
    queryKey: [
      'analytics-hotspots-rankings',
      applied.startDate,
      applied.endDate,
      hotspotRankTopN
    ],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) {
        return null;
      }

      const periodStart = `${applied.startDate}T00:00:00.000Z`;
      const periodEnd = `${applied.endDate}T23:59:59.999Z`;
      try {
        return await analyticsApi.getHotspotRankings(
          {
            periodStart,
            periodEnd,
            topN: hotspotRankTopN,
            areaLevel: HOTSPOT_RANKINGS_AREA_LEVEL
          },
          token
        );
      } catch (error) {
        console.error('[Analytics][Hotspots] Error fetching rankings', error);
        return null;
      }
    }
  });

  const fetchFrequency =
    (applied.metric === 'all' || applied.metric === 'frequency') &&
    applied.areaId !== 'all';

  const frequencyQuery = useQuery<FrequencyAnalyticsResponse | null>({
    queryKey: [
      'analytics-frequency',
      applied.areaId,
      applied.bucketType,
      applied.startDate,
      applied.endDate
    ],
    enabled: fetchFrequency,
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) {
        return null;
      }
      if (applied.areaId === 'all') return null;

      try {
        return await analyticsApi.getFrequencyAnalytics(
          {
            administrativeAreaId: applied.areaId,
            bucketType: applied.bucketType,
            startDate: applied.startDate,
            endDate: applied.endDate
          },
          token
        );
      } catch (error) {
        console.error('[Analytics][Frequency] Error', error);
        return null;
      }
    }
  });

  const fetchSeverity =
    (applied.metric === 'all' || applied.metric === 'severity') &&
    applied.areaId !== 'all';

  const severityQuery = useQuery<SeverityAnalyticsResponse | null>({
    queryKey: [
      'analytics-severity',
      applied.areaId,
      applied.bucketType,
      applied.startDate,
      applied.endDate
    ],
    enabled: fetchSeverity,
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) {
        return null;
      }
      if (applied.areaId === 'all') return null;

      try {
        return await analyticsApi.getSeverityAnalytics(
          {
            administrativeAreaId: applied.areaId,
            bucketType: applied.bucketType,
            startDate: applied.startDate,
            endDate: applied.endDate
          },
          token
        );
      } catch (error) {
        console.error('[Analytics][Severity] Error', error);
        return null;
      }
    }
  });

  const liveFrequencySeries = React.useMemo(() => {
    return frequencyQuery.data?.data?.dataPoints ?? [];
  }, [frequencyQuery.data]);

  const liveSeveritySeries = React.useMemo(() => {
    return severityQuery.data?.data?.dataPoints ?? [];
  }, [severityQuery.data]);

  const hotspotItems = React.useMemo(() => {
    return hotspotQuery.data?.data?.hotspots ?? [];
  }, [hotspotQuery.data]);

  const onTrigger = React.useCallback(
    async (
      payload:
        | FrequencyAggregationRequest
        | SeverityAggregationRequest
        | HotspotAggregationRequest
    ) => {
      const token = await getAccessToken();
      if (!token) {
        toast.error('Cần đăng nhập.');
        throw new Error('Unauthorized');
      }
      const type = quickActionType;
      if (!type) throw new Error('Missing job type');

      try {
        if (type === 'frequency') {
          await analyticsApi.triggerFrequencyAggregation(
            payload as FrequencyAggregationRequest,
            token
          );
        } else if (type === 'severity') {
          await analyticsApi.triggerSeverityAggregation(
            payload as SeverityAggregationRequest,
            token
          );
        } else {
          await analyticsApi.triggerHotspotAggregation(
            payload as HotspotAggregationRequest,
            token
          );
        }
        toast.success(
          'Đã trigger job. Xem trạng thái tại Background jobs (Hangfire).'
        );
      } catch (e) {
        if (e instanceof AnalyticsApiError) toast.error(e.message);
        else toast.error('Kích hoạt thất bại.');
        throw e;
      }
    },
    [quickActionType]
  );

  const showRanking = fetchHotspots;
  const showTrend =
    applied.metric === 'all' ||
    applied.metric === 'frequency' ||
    applied.metric === 'severity';

  const trendMode: 'frequency' | 'severity' | null = !showTrend
    ? null
    : applied.metric === 'severity'
      ? 'severity'
      : 'frequency';

  const doRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['analytics-hotspots-rankings']
        }),
        queryClient.invalidateQueries({ queryKey: ['analytics-frequency'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics-severity'] }),
        queryClient.invalidateQueries({
          queryKey: ['administrative-areas', 'analytics', 'street']
        })
      ]);
      toast.message('Đã làm mới dữ liệu');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className='space-y-4'>
      <AnalyticsHeader
        onRefresh={() => void doRefresh()}
        onTrigger={(t) => setQuickActionType(t)}
        isRefreshing={isRefreshing}
      />

      <AnalyticsFilters
        areas={areas}
        areasLoading={areasLoading}
        value={filters}
        onChange={setFilters}
        onApply={() => applyFilters(filters)}
        onReset={() => {
          const next: AnalyticsFiltersState = {
            metric: 'all',
            bucketType: 'day',
            startDate: today(),
            endDate: format(addDays(new Date(), 6), 'yyyy-MM-dd'),
            areaId: 'all',
            topN: 50
          };
          setFilters(next);
          applyFilters(next);
        }}
      />

      <Card className='border-border shadow-none'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base'>
            {showRanking && showTrend
              ? 'Xếp hạng & xu hướng'
              : showRanking
                ? 'Xếp hạng điểm nóng'
                : trendMode === 'severity'
                  ? 'Xu hướng mức độ'
                  : 'Xu hướng tần suất'}
          </CardTitle>
          <CardDescription>
            {showRanking && showTrend
              ? 'Xếp hạng khu vực ngập nổi bật và biểu đồ xu hướng theo thời gian.'
              : showRanking
                ? 'Danh sách khu vực có điểm ngập cao trong khoảng thời gian đã chọn.'
                : trendMode === 'severity'
                  ? 'Mức nước theo từng khoảng thời gian tại khu vực đã chọn.'
                  : 'Số sự kiện và lần vượt ngưỡng theo từng khoảng thời gian.'}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-5'>
          {showRanking ? (
            <HotspotRankingCard
              items={hotspotItems}
              apiTopN={hotspotRankTopN}
              pageSize={6}
              noOuterCard
            />
          ) : null}
          {showTrend && trendMode ? (
            <div
              className={
                showRanking
                  ? 'border-border space-y-4 border-t pt-5'
                  : 'space-y-4'
              }
            >
              {trendMode === 'severity' ? (
                <SeverityChartCard data={liveSeveritySeries} noOuterCard />
              ) : (
                <FrequencyChartCard data={liveFrequencySeries} noOuterCard />
              )}
              <AnalyticsTrendPointsTable
                mode={trendMode === 'severity' ? 'severity' : 'frequency'}
                points={
                  trendMode === 'severity'
                    ? liveSeveritySeries
                    : liveFrequencySeries
                }
                pageSize={8}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {quickActionType !== null ? (
        <QuickActionModal
          isOpen
          onClose={() => setQuickActionType(null)}
          jobType={quickActionType}
          areas={areas}
          onTrigger={onTrigger}
        />
      ) : null}
    </div>
  );
}
