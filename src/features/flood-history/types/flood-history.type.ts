export type UUID = string;

export type FloodSeverity =
  | 'safe'
  | 'caution'
  | 'warning'
  | 'critical'
  | string;
export type FloodQualityFlag = 'ok' | 'suspect' | 'bad' | string;

export type PeriodPreset =
  | 'last24hours'
  | 'last7days'
  | 'last30days'
  | 'last90days'
  | 'last365days'
  | 'custom';

export type TrendsGranularity = 'daily' | 'weekly' | 'monthly';
export type HistoryGranularity = 'raw' | 'hourly' | 'daily';

export interface ApiEnvelope {
  success: boolean;
  message: string;
  statusCode: number;
}

export interface Pagination {
  hasMore: boolean;
  nextCursor: string | null;
  totalCount: number;
}

export interface FloodDataPointDto {
  timestamp: string;
  value: number;
  valueMeters?: number | null;
  qualityFlag?: FloodQualityFlag | null;
  severity?: FloodSeverity | null;
}

export interface FloodHistoryMetadata {
  startDate: string;
  endDate: string;
  granularity: HistoryGranularity | string;
  totalDataPoints: number;
  missingIntervals: number;
  lastUpdated?: string | null;
}

export interface FloodHistoryDto {
  stationId: UUID;
  stationName: string;
  stationCode: string;
  dataPoints: FloodDataPointDto[];
  metadata: FloodHistoryMetadata;
}

export interface FloodTrendDataPoint {
  period: string;
  periodStart: string;
  periodEnd: string;
  maxLevel: number;
  minLevel: number;
  avgLevel: number;
  readingCount: number;
  floodHours: number;
  rainfallTotal?: number | null;
  peakSeverity: FloodSeverity;
}

export interface FloodTrendComparison {
  previousPeriodStart: string;
  previousPeriodEnd: string;
  avgLevelChange?: number | null;
  floodHoursChange?: number | null;
  peakLevelChange?: number | null;
}

export interface FloodTrendSummary {
  totalFloodHours: number;
  avgWaterLevel: number;
  maxWaterLevel: number;
  daysWithFlooding: number;
  mostAffectedDay: string;
}

export interface FloodTrendDto {
  stationId: UUID;
  stationName: string;
  period: string;
  granularity: TrendsGranularity | string;
  dataPoints: FloodTrendDataPoint[];
  comparison?: FloodTrendComparison;
  summary?: FloodTrendSummary;
}

export interface MissingInterval {
  start: string;
  end: string;
  durationMinutes: number;
}

export interface FloodStatisticsSummary {
  maxWaterLevel: number;
  minWaterLevel: number;
  avgWaterLevel: number;
  totalFloodHours: number;
  totalReadings: number;
  missingIntervals: number;
}

export interface FloodStatisticsSeverityBreakdown {
  hoursSafe: number;
  hoursCaution: number;
  hoursWarning: number;
  hoursCritical: number;
}

export interface FloodStatisticsComparison {
  avgLevelChange?: number | null;
  floodHoursChange?: number | null;
}

export interface FloodStatisticsDataQuality {
  completeness?: number | null;
  missingIntervals?: MissingInterval[];
}

export interface FloodStatisticsDto {
  stationId: UUID;
  stationName: string;
  stationCode: string;
  periodStart: string;
  periodEnd: string;
  summary: FloodStatisticsSummary;
  severityBreakdown?: FloodStatisticsSeverityBreakdown;
  comparison?: FloodStatisticsComparison;
  dataQuality?: FloodStatisticsDataQuality;
}

export type GetFloodHistoryParams = {
  stationId?: UUID | null;
  stationIds?: UUID[] | null;
  areaId?: UUID | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  granularity?: HistoryGranularity | string | null;
  limit?: number | null;
  cursor?: string | null;
};

export type GetFloodTrendsParams = {
  stationId: UUID;
  period?: PeriodPreset | string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  granularity?: TrendsGranularity | string | null;
  compareWithPrevious?: boolean | null;
};

export type GetFloodStatisticsParams = {
  stationId?: UUID | null;
  stationIds?: UUID[] | null;
  areaId?: UUID | null;
  period?: PeriodPreset | string | null;
  includeBreakdown?: boolean | null;
};

export interface GetFloodHistoryResponse extends ApiEnvelope {
  data: FloodHistoryDto | FloodHistoryDto[];
  pagination?: Pagination;
}

export interface GetFloodTrendsResponse extends ApiEnvelope {
  data: FloodTrendDto;
}

export interface GetFloodStatisticsResponse extends ApiEnvelope {
  data: FloodStatisticsDto | FloodStatisticsDto[];
}
