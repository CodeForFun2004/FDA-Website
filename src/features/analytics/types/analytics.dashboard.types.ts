export type AnalyticsMetricType = 'all' | 'frequency' | 'severity' | 'hotspots';

export type AnalyticsJobType = 'FREQUENCY' | 'SEVERITY' | 'HOTSPOTS';

export type JobStatus = 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export type AreaLevel = 'ward' | 'street' | 'all';

export interface JobRun {
  jobRunId: string;
  jobType: AnalyticsJobType;
  status: JobStatus;
  startedAt: string; // ISO
  finishedAt?: string | null; // ISO
  executionTimeMs?: number | null;
  recordsProcessed?: number | null;
  recordsCreated?: number | null;
  errorMessage?: string | null;
}

export interface FrequencyAnalyticsPoint {
  timeBucket: string; // ISO or yyyy-MM-dd label from API
  eventCount: number;
  exceedCount: number;
  calculatedAt: string; // ISO
}

export interface SeverityAnalyticsPoint {
  timeBucket: string;
  maxLevel: number;
  avgLevel: number;
  minLevel: number;
  durationHours: number;
  readingCount: number;
  calculatedAt: string; // ISO
}

export interface HotspotItem {
  areaId: string;
  areaName: string;
  score: number;
  rank: number;
  frequencyScore: number;
  severityScore: number;
  durationScore: number;
  calculatedAt: string; // ISO
}

export interface HotspotRankingsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    periodStart: string;
    periodEnd: string;
    areaLevel: string;
    hotspots: HotspotItem[];
  };
}

export interface FrequencyAnalyticsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    administrativeAreaId: string;
    administrativeAreaName: string;
    bucketType: string;
    dataPoints: FrequencyAnalyticsPoint[];
    jobRunId?: string;
  };
}

export interface SeverityAnalyticsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    administrativeAreaId: string;
    administrativeAreaName: string;
    bucketType: string;
    dataPoints: SeverityAnalyticsPoint[];
    jobRunId?: string;
  };
}

export interface JobStatusResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    jobRunId: string;
    jobType: string;
    status: JobStatus;
    startedAt: string;
    finishedAt?: string | null;
    executionTimeMs?: number | null;
    recordsProcessed?: number | null;
    recordsCreated?: number | null;
    errorMessage?: string | null;
  };
}
