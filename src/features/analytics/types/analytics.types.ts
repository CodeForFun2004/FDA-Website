/**
 * FE-17 Analytics — types for Quick Action aggregation modal & API mapping.
 */

export type BucketType = 'day' | 'week' | 'month' | 'year';

/** Area row used by QuickActionModal (aligned with admin administrative areas listing). */
export interface AdministrativeArea {
  id: string;
  name: string;
  level: string;
  parentId?: string | null;
  code?: string | null;
  geometry?: string | null;
}

/** Built by QuickActionModal; empty administrativeAreaIds means all areas. */
export interface FrequencyAggregationRequest {
  bucketType: BucketType;
  startDate: string;
  endDate: string;
  administrativeAreaIds: string[];
}

export interface SeverityAggregationRequest {
  bucketType: BucketType;
  startDate: string;
  endDate: string;
  administrativeAreaIds: string[];
}

export interface HotspotAggregationRequest {
  periodStart: string;
  periodEnd: string;
  topN: number;
}

export type AggregationTriggerPayload =
  | FrequencyAggregationRequest
  | SeverityAggregationRequest
  | HotspotAggregationRequest;

/** Backend request bodies (FE-17 doc): areaIds optional / null = all areas. */
export type AggregateFrequencyApiBody = {
  bucketType: BucketType;
  startDate: string;
  endDate: string;
  areaIds?: string[] | null;
};

export type AggregateSeverityApiBody = {
  bucketType: BucketType;
  startDate: string;
  endDate: string;
  areaIds?: string[] | null;
};

export type AggregateHotspotsApiBody = {
  periodStart: string;
  periodEnd: string;
  topN?: number;
};
