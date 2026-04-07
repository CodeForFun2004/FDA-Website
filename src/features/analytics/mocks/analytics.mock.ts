import { addDays, addMinutes, subHours, subMinutes } from 'date-fns';
import type {
  FrequencyAnalyticsPoint,
  HotspotItem,
  JobRun,
  JobStatus,
  SeverityAnalyticsPoint
} from '@/features/analytics/types/analytics.dashboard.types';
import type { BucketType } from '@/features/analytics/types/analytics.types';

function iso(d: Date) {
  return d.toISOString();
}

function makeJobRunId(seed: number) {
  return `job_${String(seed).padStart(6, '0')}`;
}

export function mockJobRuns(now = new Date()): JobRun[] {
  const base = subHours(now, 36);
  const rows: JobRun[] = [
    {
      jobRunId: makeJobRunId(172391),
      jobType: 'FREQUENCY',
      status: 'RUNNING',
      startedAt: iso(subMinutes(now, 11)),
      finishedAt: null,
      executionTimeMs: null,
      recordsProcessed: 182_450,
      recordsCreated: 0
    },
    {
      jobRunId: makeJobRunId(172389),
      jobType: 'SEVERITY',
      status: 'SUCCESS',
      startedAt: iso(subHours(now, 6)),
      finishedAt: iso(subHours(now, 5)),
      executionTimeMs: 58_412,
      recordsProcessed: 1_204_112,
      recordsCreated: 21_480
    },
    {
      jobRunId: makeJobRunId(172388),
      jobType: 'HOTSPOTS',
      status: 'FAILED',
      startedAt: iso(subHours(now, 9)),
      finishedAt: iso(subHours(now, 9)),
      executionTimeMs: 12_998,
      recordsProcessed: 0,
      recordsCreated: 0,
      errorMessage:
        'Area level mismatch: expected ward aggregation but got district ids.'
    }
  ];

  for (let i = 0; i < 12; i++) {
    const t = addMinutes(base, i * 90);
    const jobType =
      i % 3 === 0 ? 'FREQUENCY' : i % 3 === 1 ? 'SEVERITY' : 'HOTSPOTS';
    const status: JobStatus = i % 7 === 0 ? 'FAILED' : 'SUCCESS';
    const exec = 18_000 + i * 1_500;
    rows.push({
      jobRunId: makeJobRunId(172300 + i),
      jobType,
      status,
      startedAt: iso(t),
      finishedAt: iso(addMinutes(t, Math.max(1, Math.floor(exec / 1000 / 60)))),
      executionTimeMs: exec,
      recordsProcessed: 250_000 + i * 12_000,
      recordsCreated: 4_500 + i * 280,
      errorMessage:
        status === 'FAILED'
          ? 'Timeout while computing bucket partitions.'
          : null
    });
  }

  return rows
    .slice()
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
    .slice(0, 25);
}

export function mockFrequencySeries(
  bucketType: BucketType,
  now = new Date()
): FrequencyAnalyticsPoint[] {
  const points = bucketType === 'day' ? 14 : bucketType === 'week' ? 12 : 12;
  const start = subHours(now, points * 24);
  const calcAt = iso(subMinutes(now, 22));
  return Array.from({ length: points }, (_, i) => {
    const d = addDays(start, i);
    const eventCount = 900 + Math.round(120 * Math.sin(i / 2) + i * 9);
    const exceedCount =
      44 + Math.max(0, Math.round(18 * Math.cos(i / 2) + i * 2));
    return {
      timeBucket: iso(d),
      eventCount,
      exceedCount,
      calculatedAt: calcAt
    };
  });
}

export function mockSeveritySeries(
  bucketType: BucketType,
  now = new Date()
): SeverityAnalyticsPoint[] {
  const points = bucketType === 'day' ? 14 : bucketType === 'week' ? 12 : 12;
  const start = subHours(now, points * 24);
  const calcAt = iso(subMinutes(now, 22));
  return Array.from({ length: points }, (_, i) => {
    const d = addDays(start, i);
    const maxLevel = 3.1 + Math.max(0, 0.9 * Math.sin(i / 3) + i * 0.03);
    const avgLevel = 2.0 + Math.max(0, 0.5 * Math.sin(i / 3) + i * 0.02);
    const minLevel = 1.2 + Math.max(0, 0.3 * Math.cos(i / 4));
    return {
      timeBucket: iso(d),
      maxLevel: Number(maxLevel.toFixed(2)),
      avgLevel: Number(avgLevel.toFixed(2)),
      minLevel: Number(minLevel.toFixed(2)),
      durationHours: Number((12 + i * 0.7).toFixed(1)),
      readingCount: 4800 + i * 120,
      calculatedAt: calcAt
    };
  });
}

export function mockHotspots(now = new Date()): HotspotItem[] {
  const calcAt = iso(subMinutes(now, 22));
  const names = [
    'Phường Bến Nghé',
    'Phường Thảo Điền',
    'Phường Hòa Cường Bắc',
    'Phường Cát Linh',
    'Phường Minh Khai',
    'Phường Hồng Hà',
    'Phường Tam Thuận',
    'Phường Tân An',
    'Phường Mỹ Đình 2',
    'Phường Dịch Vọng'
  ];
  return names.map((name, idx) => {
    const rank = idx + 1;
    const frequencyScore = 38 - idx * 2;
    const severityScore = 31 - idx * 1.4;
    const durationScore = 24 - idx * 1.2;
    const score = frequencyScore + severityScore + durationScore;
    return {
      areaId: `area_${String(900 + idx)}`,
      areaName: name,
      rank,
      frequencyScore: Number(frequencyScore.toFixed(1)),
      severityScore: Number(severityScore.toFixed(1)),
      durationScore: Number(durationScore.toFixed(1)),
      score: Number(score.toFixed(1)),
      calculatedAt: calcAt
    };
  });
}
