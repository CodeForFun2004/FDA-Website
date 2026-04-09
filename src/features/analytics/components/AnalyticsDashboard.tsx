'use client';

import * as React from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAdministrativeAreasApi } from '@/features/admin/api/admin.api';
import { getAccessToken } from '@/libs/auth-utils';
import {
  AnalyticsApiError,
  analyticsApi
} from '@/features/analytics/api/analytics.api';
import QuickActionModal from '@/features/analytics/components/QuickActionModal';
import type {
  AdministrativeArea,
  FrequencyAggregationRequest,
  HotspotAggregationRequest,
  SeverityAggregationRequest
} from '@/features/analytics/types/analytics.types';
import type { BucketType } from '@/features/analytics/types/analytics.types';
import {
  mockFrequencySeries,
  mockHotspots,
  mockSeveritySeries
} from '@/features/analytics/mocks/analytics.mock';
import type {
  AnalyticsMetricType,
  FrequencyAnalyticsResponse,
  HotspotRankingsResponse
} from '@/features/analytics/types/analytics.dashboard.types';
import type {
  JobRun,
  AnalyticsJobType,
  SeverityAnalyticsResponse,
  JobStatusResponse
} from '@/features/analytics/types/analytics.dashboard.types';
import { AnalyticsHeader } from '@/features/analytics/components/dashboard/AnalyticsHeader';
import {
  AnalyticsFilters,
  type AnalyticsFiltersState
} from '@/features/analytics/components/dashboard/AnalyticsFilters';
import { AnalyticsOverviewCards } from '@/features/analytics/components/dashboard/AnalyticsOverviewCards';
import { AggregationActionsPanel } from '@/features/analytics/components/dashboard/AggregationActionsPanel';
import { JobMonitorPanel } from '@/features/analytics/components/dashboard/JobMonitorPanel';
import { FrequencyChartCard } from '@/features/analytics/components/dashboard/FrequencyChartCard';
import { SeverityChartCard } from '@/features/analytics/components/dashboard/SeverityChartCard';
import { HotspotRankingCard } from '@/features/analytics/components/dashboard/HotspotRankingCard';
import { AggregatedDataTable } from '@/features/analytics/components/dashboard/AggregatedDataTable';
import { addDays, format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

type TriggerType = 'frequency' | 'severity' | 'hotspots';

function today() {
  return format(new Date(), 'yyyy-MM-dd');
}

function tryExtractJobRunId(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const anyVal = value as any;
  const candidates = [
    anyVal?.jobRunId,
    anyVal?.jobId,
    anyVal?.data?.jobRunId,
    anyVal?.data?.jobId,
    anyVal?.data?.job?.jobRunId,
    anyVal?.data?.job?.jobId,
    anyVal?.data?.result?.jobRunId
  ].filter((x) => typeof x === 'string' && x.length > 0);
  return (candidates[0] as string | undefined) ?? null;
}

function uniqPush(prev: string[], next: string) {
  if (!next) return prev;
  if (prev.includes(next)) return prev;
  return [next, ...prev].slice(0, 30);
}

export function AnalyticsDashboard() {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [quickActionType, setQuickActionType] =
    React.useState<TriggerType | null>(null);
  const [activeTab, setActiveTab] = React.useState<
    'overview' | 'jobs' | 'results' | 'operations'
  >('overview');
  const [opsActiveType, setOpsActiveType] =
    React.useState<TriggerType>('frequency');
  const [trackedJobRunIds, setTrackedJobRunIds] = React.useState<string[]>(
    () => {
      if (typeof window === 'undefined') return [];
      try {
        const raw = window.localStorage.getItem('analytics.trackedJobRunIds');
        const parsed = raw ? (JSON.parse(raw) as unknown) : [];
        return Array.isArray(parsed)
          ? (parsed.filter((x) => typeof x === 'string') as string[])
          : [];
      } catch {
        return [];
      }
    }
  );

  React.useEffect(() => {
    try {
      window.localStorage.setItem(
        'analytics.trackedJobRunIds',
        JSON.stringify(trackedJobRunIds)
      );
    } catch {
      // ignore
    }
  }, [trackedJobRunIds]);

  const [filters, setFilters] = React.useState<AnalyticsFiltersState>(() => ({
    metric: 'all',
    bucketType: 'day',
    startDate: today(),
    endDate: format(addDays(new Date(), 6), 'yyyy-MM-dd'),
    areaId: 'all',
    areaLevel: 'all',
    topN: 10
  }));
  const [applied, setApplied] = React.useState(filters);
  const applyFilters = React.useCallback((next: AnalyticsFiltersState) => {
    setApplied(next);
    setActiveTab(next.metric === 'hotspots' ? 'results' : 'results');
    toast.message('Filters applied');
  }, []);

  const { data: areasData } = useQuery({
    queryKey: ['administrative-areas'],
    queryFn: () => getAdministrativeAreasApi(),
    staleTime: 5 * 60 * 1000
  });

  const areas = React.useMemo(
    () => mapAreasForModal(areasData?.administrativeAreas ?? []),
    [areasData?.administrativeAreas]
  );

  const frequencySeries = React.useMemo(
    () => mockFrequencySeries(applied.bucketType as BucketType),
    [applied.bucketType]
  );
  const severitySeries = React.useMemo(
    () => mockSeveritySeries(applied.bucketType as BucketType),
    [applied.bucketType]
  );

  const hotspotQuery = useQuery<HotspotRankingsResponse | null>({
    queryKey: [
      'analytics-hotspots-rankings',
      applied.startDate,
      applied.endDate,
      applied.topN,
      applied.areaLevel
    ],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) {
        console.log(
          '[Analytics][Hotspots] No access token, skip fetch rankings'
        );
        return null;
      }

      const periodStart = new Date(applied.startDate).toISOString();
      const periodEnd = new Date(applied.endDate).toISOString();
      const areaLevel =
        applied.areaLevel === 'all' ? undefined : applied.areaLevel;

      console.log('[Analytics][Hotspots] Fetch rankings', {
        periodStart,
        periodEnd,
        topN: applied.topN,
        areaLevel
      });

      try {
        const res = await analyticsApi.getHotspotRankings(
          {
            periodStart,
            periodEnd,
            topN: applied.topN,
            areaLevel
          },
          token
        );

        console.log('[Analytics][Hotspots] Response', {
          hotspots: res.data.hotspots.length,
          periodStart: res.data.periodStart,
          periodEnd: res.data.periodEnd,
          areaLevel: res.data.areaLevel
        });

        if (!res.data.hotspots.length) {
          console.log(
            '[Analytics][Hotspots] Empty hotspots array from API – using mock data for UI.'
          );
        }

        return res;
      } catch (error) {
        console.error('[Analytics][Hotspots] Error fetching rankings', error);
        return null;
      }
    }
  });

  const frequencyQuery = useQuery<FrequencyAnalyticsResponse | null>({
    queryKey: [
      'analytics-frequency',
      applied.areaId,
      applied.bucketType,
      applied.startDate,
      applied.endDate
    ],
    enabled: applied.areaId !== 'all' && applied.metric !== 'hotspots',
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) {
        console.log('[Analytics][Frequency] No access token, skip fetch');
        return null;
      }
      if (applied.areaId === 'all') return null;

      const startDate = new Date(applied.startDate).toISOString();
      const endDate = new Date(applied.endDate).toISOString();

      console.log('[Analytics][Frequency] Fetch', {
        administrativeAreaId: applied.areaId,
        bucketType: applied.bucketType,
        startDate,
        endDate
      });

      try {
        const res = await analyticsApi.getFrequencyAnalytics(
          {
            administrativeAreaId: applied.areaId,
            bucketType: applied.bucketType,
            startDate,
            endDate
          },
          token
        );

        console.log('[Analytics][Frequency] Response', {
          points: res.data.dataPoints?.length ?? 0,
          area: res.data.administrativeAreaName,
          bucketType: res.data.bucketType
        });

        const jobRunId = tryExtractJobRunId(res);
        if (jobRunId) setTrackedJobRunIds((prev) => uniqPush(prev, jobRunId));

        return res;
      } catch (error) {
        console.error('[Analytics][Frequency] Error', error);
        return null;
      }
    }
  });

  const severityQuery = useQuery<SeverityAnalyticsResponse | null>({
    queryKey: [
      'analytics-severity',
      applied.areaId,
      applied.bucketType,
      applied.startDate,
      applied.endDate
    ],
    enabled: applied.areaId !== 'all' && applied.metric !== 'hotspots',
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) {
        console.log('[Analytics][Severity] No access token, skip fetch');
        return null;
      }
      if (applied.areaId === 'all') return null;

      const startDate = new Date(applied.startDate).toISOString();
      const endDate = new Date(applied.endDate).toISOString();

      console.log('[Analytics][Severity] Fetch', {
        administrativeAreaId: applied.areaId,
        bucketType: applied.bucketType,
        startDate,
        endDate
      });

      try {
        const res = await analyticsApi.getSeverityAnalytics(
          {
            administrativeAreaId: applied.areaId,
            bucketType: applied.bucketType,
            startDate,
            endDate
          },
          token
        );

        console.log('[Analytics][Severity] Response', {
          points: res.data.dataPoints?.length ?? 0,
          area: res.data.administrativeAreaName,
          bucketType: res.data.bucketType
        });

        const jobRunId = tryExtractJobRunId(res);
        if (jobRunId) setTrackedJobRunIds((prev) => uniqPush(prev, jobRunId));

        return res;
      } catch (error) {
        console.error('[Analytics][Severity] Error', error);
        return null;
      }
    }
  });

  const liveFrequencySeries = React.useMemo(() => {
    const points = frequencyQuery.data?.data?.dataPoints ?? [];
    if (points.length > 0) return points;
    return frequencySeries;
  }, [frequencyQuery.data, frequencySeries]);

  const liveSeveritySeries = React.useMemo(() => {
    const points = severityQuery.data?.data?.dataPoints ?? [];
    if (points.length > 0) return points;
    return severitySeries;
  }, [severityQuery.data, severitySeries]);

  const jobStatusQueries = useQueries({
    queries: trackedJobRunIds.map((jobRunId) => ({
      queryKey: ['analytics-job-status', jobRunId],
      queryFn: async (): Promise<JobStatusResponse | null> => {
        const token = await getAccessToken();
        if (!token) return null;
        console.log('[Analytics][JobStatus] Fetch', { jobRunId });
        try {
          const res = await analyticsApi.getJobStatus(jobRunId, token);
          console.log('[Analytics][JobStatus] Response', res.data);
          return res;
        } catch (error) {
          console.error('[Analytics][JobStatus] Error', { jobRunId, error });
          return null;
        }
      },
      refetchInterval: (q: any) => {
        const status = q.state.data?.data?.status;
        return status === 'RUNNING' ? 5000 : false;
      }
    }))
  });

  const liveJobRuns = React.useMemo(() => {
    const rows: JobRun[] = [];
    for (const q of jobStatusQueries) {
      const status = q.data?.data;
      if (!status?.jobRunId) continue;
      const mappedJobType: AnalyticsJobType =
        status.jobType === 'FREQUENCY_AGG'
          ? 'FREQUENCY'
          : status.jobType === 'SEVERITY_AGG'
            ? 'SEVERITY'
            : 'HOTSPOTS';

      rows.push({
        jobRunId: status.jobRunId,
        jobType: mappedJobType,
        status: status.status,
        startedAt: status.startedAt,
        finishedAt: status.finishedAt ?? null,
        executionTimeMs: status.executionTimeMs ?? null,
        recordsProcessed: status.recordsProcessed ?? null,
        recordsCreated: status.recordsCreated ?? null,
        errorMessage: status.errorMessage ?? null
      });
    }
    return rows.sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
  }, [jobStatusQueries]);

  const hotspotItems = React.useMemo(() => {
    const live = hotspotQuery.data?.data?.hotspots ?? [];
    if (live.length > 0) {
      return live;
    }
    return mockHotspots();
  }, [hotspotQuery.data, applied.topN, applied.areaLevel]);

  const latestCalculatedAt = React.useMemo(() => {
    const calc =
      (applied.metric === 'severity'
        ? liveSeveritySeries[0]?.calculatedAt
        : applied.metric === 'hotspots'
          ? hotspotItems[0]?.calculatedAt
          : liveFrequencySeries[0]?.calculatedAt) ?? null;
    return calc;
  }, [applied.metric, liveFrequencySeries, liveSeveritySeries, hotspotItems]);

  const aggregatedRecordsTotal = React.useMemo(() => {
    return liveJobRuns.reduce((s, r) => s + (r.recordsCreated ?? 0), 0);
  }, [liveJobRuns]);

  const onTrigger = React.useCallback(
    async (
      payload:
        | FrequencyAggregationRequest
        | SeverityAggregationRequest
        | HotspotAggregationRequest
    ) => {
      const token = await getAccessToken();
      if (!token) {
        toast.error('Authentication required.');
        throw new Error('Unauthorized');
      }
      const type = quickActionType;
      if (!type) throw new Error('Missing job type');

      try {
        if (type === 'frequency') {
          const res = await analyticsApi.triggerFrequencyAggregation(
            payload as FrequencyAggregationRequest,
            token
          );
          const jobRunId = tryExtractJobRunId(res);
          if (jobRunId) setTrackedJobRunIds((prev) => uniqPush(prev, jobRunId));
        } else if (type === 'severity') {
          const res = await analyticsApi.triggerSeverityAggregation(
            payload as SeverityAggregationRequest,
            token
          );
          const jobRunId = tryExtractJobRunId(res);
          if (jobRunId) setTrackedJobRunIds((prev) => uniqPush(prev, jobRunId));
        } else {
          const res = await analyticsApi.triggerHotspotAggregation(
            payload as HotspotAggregationRequest,
            token
          );
          const jobRunId = tryExtractJobRunId(res);
          if (jobRunId) setTrackedJobRunIds((prev) => uniqPush(prev, jobRunId));
        }
        toast.success(
          'Job triggered. Check Job monitor for RUNNING → SUCCESS/FAILED.'
        );
      } catch (e) {
        if (e instanceof AnalyticsApiError) toast.error(e.message);
        else toast.error('Trigger failed.');
        throw e;
      }
    },
    [quickActionType]
  );

  const metricForViz: AnalyticsMetricType =
    applied.metric === 'all' ? 'frequency' : applied.metric;

  const openJobMonitor = () => {
    const el = document.getElementById('job-monitor');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const doRefresh = async () => {
    setIsRefreshing(true);
    try {
      // placeholder: will refetch real queries later
      await new Promise((r) => setTimeout(r, 400));
      toast.message('Refreshed');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className='space-y-4'>
      <AnalyticsHeader
        activeTab={activeTab}
        onRefresh={() => void doRefresh()}
        onOpenJobMonitor={() => {
          setActiveTab('jobs');
          setTimeout(openJobMonitor, 0);
        }}
        onTrigger={(t) => {
          setActiveTab('operations');
          setOpsActiveType(t);
          setQuickActionType(t);
        }}
        isRefreshing={isRefreshing}
      />

      <AnalyticsFilters
        areas={areas}
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
            areaLevel: 'all',
            topN: 10
          };
          setFilters(next);
          applyFilters(next);
        }}
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <TabsList className='w-full justify-start md:w-auto'>
            <TabsTrigger
              value='overview'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value='jobs'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Jobs
            </TabsTrigger>
            <TabsTrigger
              value='results'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Results
            </TabsTrigger>
            <TabsTrigger
              value='operations'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Operations
            </TabsTrigger>
          </TabsList>

          <div className='text-muted-foreground text-xs'>
            Tip: use tabs to focus by task (monitor → results → rerun).
          </div>
        </div>

        <TabsContent value='overview' className='mt-4 space-y-4'>
          <AnalyticsOverviewCards
            jobRuns={liveJobRuns}
            aggregatedRecordsTotal={aggregatedRecordsTotal}
            latestCalculatedAt={latestCalculatedAt}
          />

          <div className='grid gap-4 xl:grid-cols-12'>
            <div className='xl:col-span-7'>
              {metricForViz === 'severity' ? (
                <SeverityChartCard data={liveSeveritySeries} />
              ) : (
                <FrequencyChartCard data={liveFrequencySeries} />
              )}
            </div>
            <div className='xl:col-span-5'>
              <JobMonitorPanel
                jobRuns={liveJobRuns}
                onRetry={(id) => toast.message(`Retry requested: ${id}`)}
                onViewDetails={(id) => toast.message(`Open details: ${id}`)}
                onTrackJobRunId={(jobRunId) =>
                  setTrackedJobRunIds((prev) => uniqPush(prev, jobRunId))
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value='jobs' className='mt-4 space-y-4'>
          <JobMonitorPanel
            jobRuns={liveJobRuns}
            onRetry={(id) => toast.message(`Retry requested: ${id}`)}
            onViewDetails={(id) => toast.message(`Open details: ${id}`)}
            onTrackJobRunId={(jobRunId) =>
              setTrackedJobRunIds((prev) => uniqPush(prev, jobRunId))
            }
          />
        </TabsContent>

        <TabsContent value='results' className='mt-4 space-y-4'>
          <div className='grid gap-4 xl:grid-cols-12'>
            <div className='xl:col-span-8'>
              {metricForViz === 'severity' ? (
                <SeverityChartCard data={liveSeveritySeries} />
              ) : (
                <FrequencyChartCard data={liveFrequencySeries} />
              )}
            </div>
            <div className='xl:col-span-4'>
              <HotspotRankingCard items={hotspotItems} topN={applied.topN} />
            </div>
          </div>

          <AggregatedDataTable
            metric={metricForViz}
            frequency={liveFrequencySeries}
            severity={liveSeveritySeries}
            hotspots={hotspotItems}
          />
        </TabsContent>

        <TabsContent value='operations' className='mt-4 space-y-4'>
          <div className='grid gap-4 xl:grid-cols-12'>
            <div className='xl:col-span-5'>
              <AggregationActionsPanel
                jobRuns={liveJobRuns}
                activeType={opsActiveType}
                onTabChange={(t) => setOpsActiveType(t)}
                onRunNow={(t) => {
                  setOpsActiveType(t);
                  setQuickActionType(t);
                }}
                onViewHistory={() => {
                  setActiveTab('jobs');
                  setTimeout(openJobMonitor, 0);
                }}
              />
            </div>
            <div className='xl:col-span-7'>
              <HotspotRankingCard items={hotspotItems} topN={applied.topN} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
