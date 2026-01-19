// src/features/flood-history/mock.ts
// Mock data shaped to resemble BE specs (G39/G40/G41). No areaId, only stationId/stationIds.

export type UUID = string;

export type FloodSeverity = 'safe' | 'caution' | 'warning' | 'critical';
export type FloodQualityFlag = 'ok' | 'suspect' | 'bad';

export type PeriodPreset =
  | 'last24hours'
  | 'last7days'
  | 'last30days'
  | 'last90days'
  | 'last365days'
  | 'custom';

export type TrendsGranularity = 'daily' | 'weekly' | 'monthly';
export type HistoryGranularity = 'raw' | 'hourly' | 'daily';

// -------- Stations --------
export const mockStations: Array<{ id: UUID; code: string; name: string }> = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    code: 'ST_DN_01',
    name: 'Station Ben Nghe'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    code: 'ST_DN_02',
    name: 'Station Hai Chau'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    code: 'ST_DN_03',
    name: 'Station Thanh Khe'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    code: 'ST_DN_04',
    name: 'Station Son Tra'
  }
];

// -------- Helpers --------
function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function iso(d: Date) {
  return d.toISOString();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// deterministic pseudo-random based on seed (stable UI)
function seeded(seed: number) {
  let t = seed % 2147483647;
  if (t <= 0) t += 2147483646;
  return () => (t = (t * 16807) % 2147483647) / 2147483647;
}

function stationSeed(stationId: UUID) {
  let acc = 0;
  for (let i = 0; i < stationId.length; i++)
    acc += stationId.charCodeAt(i) * (i + 1);
  return acc;
}

function severityFromCm(v: number): FloodSeverity {
  // tweak thresholds as you like
  if (v < 120) return 'safe';
  if (v < 180) return 'caution';
  if (v < 240) return 'warning';
  return 'critical';
}

function qualityFromIdx(i: number): FloodQualityFlag {
  if (i % 37 === 0) return 'suspect';
  if (i % 91 === 0) return 'bad';
  return 'ok';
}

function periodRangeEndUtc(): Date {
  // fixed "now" for consistent snapshots
  return new Date('2026-01-16T10:30:00Z');
}

export function computeRange(period: PeriodPreset): { start: Date; end: Date } {
  const end = periodRangeEndUtc();
  const start = new Date(end);
  const dayMs = 24 * 60 * 60 * 1000;

  switch (period) {
    case 'last24hours':
      start.setTime(end.getTime() - dayMs);
      break;
    case 'last7days':
      start.setTime(end.getTime() - 7 * dayMs);
      break;
    case 'last30days':
      start.setTime(end.getTime() - 30 * dayMs);
      break;
    case 'last90days':
      start.setTime(end.getTime() - 90 * dayMs);
      break;
    case 'last365days':
      start.setTime(end.getTime() - 365 * dayMs);
      break;
    case 'custom':
    default:
      start.setTime(end.getTime() - 30 * dayMs);
  }

  return { start, end };
}

// -------- Shapes (similar to BE) --------
export type FloodHistoryPoint = {
  timestamp: string;
  value: number; // cm
  valueMeters?: number | null;
  qualityFlag?: FloodQualityFlag | null;
  severity?: FloodSeverity | null;
};

export type FloodHistoryDto = {
  stationId: UUID;
  stationName: string;
  stationCode: string;
  dataPoints: FloodHistoryPoint[];
  metadata: {
    startDate: string;
    endDate: string;
    granularity: HistoryGranularity;
    totalDataPoints: number;
    missingIntervals: number;
    lastUpdated?: string | null;
  };
};

export type FloodTrendPoint = {
  period: string; // "YYYY-MM-DD" or "YYYY-Wxx" or "YYYY-MM"
  periodStart: string;
  periodEnd: string;
  maxLevel: number;
  minLevel: number;
  avgLevel: number;
  readingCount: number;
  floodHours: number;
  rainfallTotal?: number | null;
  peakSeverity: FloodSeverity;
};

export type FloodTrendDto = {
  stationId: UUID;
  stationName: string;
  period: PeriodPreset | string;
  granularity: TrendsGranularity;
  dataPoints: FloodTrendPoint[];
  comparison?: {
    previousPeriodStart: string;
    previousPeriodEnd: string;
    avgLevelChange?: number | null;
    floodHoursChange?: number | null;
    peakLevelChange?: number | null;
  };
  summary?: {
    totalFloodHours: number;
    avgWaterLevel: number;
    maxWaterLevel: number;
    daysWithFlooding: number;
    mostAffectedDay?: string | null;
  };
};

export type FloodStatisticsDto = {
  stationId: UUID;
  stationName: string;
  stationCode: string;
  periodStart: string;
  periodEnd: string;
  summary: {
    maxWaterLevel: number;
    minWaterLevel: number;
    avgWaterLevel: number;
    totalFloodHours: number;
    totalReadings: number;
    missingIntervals: number;
  };
  severityBreakdown?: {
    hoursSafe: number;
    hoursCaution: number;
    hoursWarning: number;
    hoursCritical: number;
  };
  comparison?: {
    avgLevelChange?: number | null;
    floodHoursChange?: number | null;
  };
  dataQuality?: {
    completeness: number;
    missingIntervals: Array<{
      start: string;
      end: string;
      durationMinutes: number;
    }>;
  };
};

// -------- Mock Generators --------
function getStationMeta(stationId: UUID) {
  const st = mockStations.find((s) => s.id === stationId) ?? mockStations[0]!;
  return st;
}

function generateHistoryPoints(
  stationId: UUID,
  start: Date,
  end: Date,
  granularity: HistoryGranularity
) {
  const rand = seeded(stationSeed(stationId));
  const points: FloodHistoryPoint[] = [];

  const intervalMs =
    granularity === 'raw'
      ? 5 * 60 * 1000
      : granularity === 'hourly'
        ? 60 * 60 * 1000
        : 24 * 60 * 60 * 1000;

  const n = Math.max(
    1,
    Math.floor((end.getTime() - start.getTime()) / intervalMs)
  );
  const base = 110 + rand() * 30; // base cm

  for (let i = 0; i <= n; i++) {
    const t = new Date(start.getTime() + i * intervalMs);
    if (t > end) break;

    // daily wave + noise
    const wave =
      Math.sin((i / Math.max(1, n)) * Math.PI * 2) * (25 + rand() * 35) +
      Math.cos((i / Math.max(1, n)) * Math.PI * 4) * (10 + rand() * 12);

    const spike = i % 29 === 0 ? 60 + rand() * 70 : 0; // occasional spike
    const v = clamp(base + wave + spike + (rand() - 0.5) * 18, 40, 360);

    points.push({
      timestamp: iso(t),
      value: Math.round(v * 10) / 10,
      valueMeters: Math.round((v / 100) * 1000) / 1000,
      qualityFlag: qualityFromIdx(i),
      severity: severityFromCm(v)
    });
  }

  return points;
}

function generateMissingIntervals(start: Date, end: Date, stationId: UUID) {
  const rand = seeded(stationSeed(stationId) + 999);
  const intervals: Array<{
    start: string;
    end: string;
    durationMinutes: number;
  }> = [];

  // create 0-2 missing intervals
  const count = Math.floor(rand() * 3); // 0..2
  for (let i = 0; i < count; i++) {
    const totalMinutes = Math.floor(
      (end.getTime() - start.getTime()) / (60 * 1000)
    );
    const gapStartMin = Math.floor(rand() * (totalMinutes - 120));
    const gapLen = 30 + Math.floor(rand() * 120); // 30-150 minutes

    const s = new Date(start.getTime() + gapStartMin * 60 * 1000);
    const e = new Date(s.getTime() + gapLen * 60 * 1000);

    intervals.push({
      start: iso(s),
      end: iso(e),
      durationMinutes: gapLen
    });
  }

  return intervals;
}

// -------- Public Mock API-like functions --------
export function getMockFloodHistory(args: {
  stationId?: UUID;
  stationIds?: UUID[];
  startDate?: string;
  endDate?: string;
  granularity?: HistoryGranularity;
}) {
  const granularity = args.granularity ?? 'hourly';
  const start = args.startDate
    ? new Date(args.startDate)
    : computeRange('last24hours').start;
  const end = args.endDate
    ? new Date(args.endDate)
    : computeRange('last24hours').end;

  // Compare mode: return array of per-station DTOs
  if (args.stationIds && args.stationIds.length > 0) {
    const dtos: FloodHistoryDto[] = args.stationIds.slice(0, 3).map((id) => {
      const st = getStationMeta(id);
      const dataPoints = generateHistoryPoints(id, start, end, granularity);
      return {
        stationId: st.id,
        stationName: st.name,
        stationCode: st.code,
        dataPoints,
        metadata: {
          startDate: iso(start),
          endDate: iso(end),
          granularity,
          totalDataPoints: dataPoints.length,
          missingIntervals: Math.floor(dataPoints.length * 0.01),
          lastUpdated: iso(periodRangeEndUtc())
        }
      };
    });

    return {
      success: true,
      message: 'Mock flood history (compare) retrieved successfully',
      statusCode: 200,
      data: dtos,
      pagination: {
        hasMore: false,
        nextCursor: null,
        totalCount: dtos.reduce((a, b) => a + b.dataPoints.length, 0)
      }
    };
  }

  const stationId = args.stationId ?? mockStations[0]!.id;
  const st = getStationMeta(stationId);
  const dataPoints = generateHistoryPoints(stationId, start, end, granularity);

  return {
    success: true,
    message: 'Mock flood history retrieved successfully',
    statusCode: 200,
    data: {
      stationId: st.id,
      stationName: st.name,
      stationCode: st.code,
      dataPoints,
      metadata: {
        startDate: iso(start),
        endDate: iso(end),
        granularity,
        totalDataPoints: dataPoints.length,
        missingIntervals: Math.floor(dataPoints.length * 0.01),
        lastUpdated: iso(periodRangeEndUtc())
      }
    } satisfies FloodHistoryDto,
    pagination: {
      hasMore: false,
      nextCursor: null,
      totalCount: dataPoints.length
    }
  };
}

export function getMockFloodTrends(args: {
  stationId: UUID;
  period?: PeriodPreset;
  granularity?: TrendsGranularity;
  compareWithPrevious?: boolean;
}) {
  const period = args.period ?? 'last30days';
  const granularity = args.granularity ?? 'daily';
  const compareWithPrevious = args.compareWithPrevious ?? false;

  const { start, end } = computeRange(period);
  const st = getStationMeta(args.stationId);
  const rand = seeded(stationSeed(st.id) + 2026);

  const points: FloodTrendPoint[] = [];

  // number of points based on granularity
  const dayMs = 24 * 60 * 60 * 1000;
  const totalDays = Math.max(
    1,
    Math.floor((end.getTime() - start.getTime()) / dayMs)
  );

  const stepDays =
    granularity === 'daily' ? 1 : granularity === 'weekly' ? 7 : 30;
  const n = Math.max(1, Math.floor(totalDays / stepDays));

  let mostAffectedDay: string | null = null;
  let maxDayFloodHours = -1;

  for (let i = 0; i < n; i++) {
    const ps = new Date(start.getTime() + i * stepDays * dayMs);
    const pe = new Date(
      Math.min(end.getTime(), ps.getTime() + stepDays * dayMs - 1)
    );

    const base = 115 + rand() * 35;
    const seasonal =
      Math.sin((i / Math.max(1, n)) * Math.PI * 2) * (18 + rand() * 25);
    const peak = i % 9 === 0 ? 50 + rand() * 80 : 0;

    const avg = clamp(base + seasonal + (rand() - 0.5) * 12, 50, 320);
    const max = clamp(avg + 25 + rand() * 55 + peak, 60, 360);
    const min = clamp(avg - (15 + rand() * 35), 40, 320);

    const floodHours = Math.max(0, Math.floor((max - 160) / 20 + rand() * 3)); // rough
    const readingCount =
      granularity === 'daily'
        ? 288
        : granularity === 'weekly'
          ? 288 * 7
          : 288 * 30;

    const periodLabel =
      granularity === 'daily'
        ? `${ps.getUTCFullYear()}-${pad2(ps.getUTCMonth() + 1)}-${pad2(ps.getUTCDate())}`
        : granularity === 'weekly'
          ? `${ps.getUTCFullYear()}-W${pad2(Math.floor(i + 1))}`
          : `${ps.getUTCFullYear()}-${pad2(ps.getUTCMonth() + 1)}`;

    if (floodHours > maxDayFloodHours && granularity === 'daily') {
      maxDayFloodHours = floodHours;
      mostAffectedDay = periodLabel;
    }

    points.push({
      period: periodLabel,
      periodStart: iso(ps),
      periodEnd: iso(pe),
      maxLevel: Math.round(max * 10) / 10,
      minLevel: Math.round(min * 10) / 10,
      avgLevel: Math.round(avg * 10) / 10,
      readingCount,
      floodHours,
      rainfallTotal: Math.round(rand() * 40 * 10) / 10,
      peakSeverity: severityFromCm(max)
    });
  }

  const totalFloodHours = points.reduce((a, p) => a + p.floodHours, 0);
  const avgWaterLevel =
    Math.round(
      (points.reduce((a, p) => a + p.avgLevel, 0) / points.length) * 10
    ) / 10;
  const maxWaterLevel = Math.max(...points.map((p) => p.maxLevel));
  const daysWithFlooding = points.filter((p) => p.floodHours > 0).length;

  const dto: FloodTrendDto = {
    stationId: st.id,
    stationName: st.name,
    period,
    granularity,
    dataPoints: points,
    summary: {
      totalFloodHours,
      avgWaterLevel,
      maxWaterLevel: Math.round(maxWaterLevel * 10) / 10,
      daysWithFlooding,
      mostAffectedDay
    }
  };

  if (compareWithPrevious) {
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(
      prevEnd.getTime() - (end.getTime() - start.getTime())
    );

    // fake deltas
    dto.comparison = {
      previousPeriodStart: iso(prevStart),
      previousPeriodEnd: iso(prevEnd),
      avgLevelChange: Math.round((rand() - 0.5) * 30 * 10) / 10, // +/- %
      floodHoursChange: Math.round((rand() - 0.5) * 50 * 10) / 10, // +/- %
      peakLevelChange: Math.round((rand() - 0.5) * 20 * 10) / 10
    };
  }

  return {
    success: true,
    message: 'Mock flood trends retrieved successfully',
    statusCode: 200,
    data: dto
  };
}

export function getMockFloodStatistics(args: {
  stationId?: UUID;
  stationIds?: UUID[];
  period?: PeriodPreset;
}) {
  const period = args.period ?? 'last30days';
  const { start, end } = computeRange(period);

  const buildOne = (stationId: UUID): FloodStatisticsDto => {
    const st = getStationMeta(stationId);
    const rand = seeded(stationSeed(stationId) + 777);

    const maxWaterLevel = 240 + rand() * 110;
    const minWaterLevel = 45 + rand() * 40;
    const avgWaterLevel = 120 + rand() * 60;

    const missingIntervals = generateMissingIntervals(start, end, stationId);
    const totalReadings =
      period === 'last24hours'
        ? 288
        : period === 'last7days'
          ? 288 * 7
          : period === 'last30days'
            ? 288 * 30
            : 288 * 90;

    const totalFloodHours = Math.floor(rand() * 120);

    // severity breakdown should sum roughly to total hours in period
    const totalHours =
      period === 'last24hours'
        ? 24
        : period === 'last7days'
          ? 24 * 7
          : period === 'last30days'
            ? 24 * 30
            : 24 * 90;

    const hoursCritical = Math.floor(rand() * 40);
    const hoursWarning = Math.floor(rand() * 50);
    const hoursCaution = Math.floor(rand() * 60);
    const used = hoursCritical + hoursWarning + hoursCaution;
    const hoursSafe = Math.max(0, totalHours - used);

    const completeness = clamp(
      100 -
        (missingIntervals.reduce((a, m) => a + m.durationMinutes, 0) /
          (totalHours * 60)) *
          100,
      85,
      100
    );

    return {
      stationId: st.id,
      stationName: st.name,
      stationCode: st.code,
      periodStart: iso(start),
      periodEnd: iso(end),
      summary: {
        maxWaterLevel: Math.round(maxWaterLevel * 10) / 10,
        minWaterLevel: Math.round(minWaterLevel * 10) / 10,
        avgWaterLevel: Math.round(avgWaterLevel * 10) / 10,
        totalFloodHours,
        totalReadings,
        missingIntervals: missingIntervals.length
      },
      severityBreakdown: {
        hoursSafe,
        hoursCaution,
        hoursWarning,
        hoursCritical
      },
      comparison: {
        avgLevelChange: Math.round((rand() - 0.5) * 25 * 10) / 10,
        floodHoursChange: Math.round((rand() - 0.5) * 40 * 10) / 10
      },
      dataQuality: {
        completeness: Math.round(completeness * 100) / 100,
        missingIntervals
      }
    };
  };

  if (args.stationIds && args.stationIds.length > 0) {
    const arr = args.stationIds.slice(0, 3).map(buildOne);
    return {
      success: true,
      message: 'Mock flood statistics (multiple) retrieved successfully',
      statusCode: 200,
      data: arr
    };
  }

  const stationId = args.stationId ?? mockStations[0]!.id;
  const one = buildOne(stationId);

  return {
    success: true,
    message: 'Mock flood statistics retrieved successfully',
    statusCode: 200,
    data: one
  };
}
