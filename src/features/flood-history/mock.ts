// src/features/flood-history/mock.ts
// Mock data shaped to resemble BE specs (G39/G40/G41). No areaId, only stationId/stationIds.

export type UUID = string;

export type FloodSeverity = 'safe' | 'caution' | 'warning' | 'critical';
export type FloodQualityFlag = 'ok' | 'suspect' | 'bad';

// -------- Area Types --------
export interface AreaDto {
  id: UUID;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  addressText: string;
  stationIds: UUID[];
}

export type PeriodPreset =
  | 'last24hours'
  | 'last7days'
  | 'last30days'
  | 'last90days'
  | 'last365days'
  | 'custom';

export type TrendsGranularity = 'daily' | 'weekly' | 'monthly';
export type HistoryGranularity = 'raw' | 'hourly' | 'daily';

// -------- Areas --------
export const mockAreas: AreaDto[] = [
  {
    id: '0d3cfd3f-2f10-4606-9e8a-338dad6c595c',
    name: 'Dragon Bridge Area',
    latitude: 16.06135,
    longitude: 108.2219,
    radiusMeters: 500,
    addressText: 'Dragon Bridge and surrounding areas, Da Nang',
    stationIds: [
      '550e8400-e29b-41d4-a716-446655440021', // ST002 - Trạm Trần Phú
      '550e8400-e29b-41d4-a716-446655440020' // ST001 - Trạm Bạch Đằng
    ]
  },
  {
    id: '1e4dfe4g-3g21-5717-0f9b-449ebe7d696d',
    name: 'Ngũ Hành Sơn District',
    latitude: 16.03552,
    longitude: 108.23785,
    radiusMeters: 1000,
    addressText: 'Ngũ Hành Sơn district monitoring stations',
    stationIds: [
      'c9c3203c-70f5-444e-b3cd-16160de0ce28', // ST_DN_NHS_09
      'c02d4c29-338f-4efd-b2f9-d2f5df7913b2', // ST_DN_NHS_08
      '4d616976-804e-4c6b-9094-8db53254a490', // ST_DN_NHS_07
      'f6a6a80f-4d06-4d85-b3ec-02dd8e4a3d80', // ST_DN_NHS_06
      'b615e406-36e0-4715-a7af-77f474c887fe', // ST_DN_NHS_05
      '5035dcd5-e14c-48d2-9495-149ae884f4c6', // ST_DN_NHS_04
      'c10bf947-be92-49fb-ab6f-50eb9a49f93b', // ST_DN_NHS_03
      '872abbd5-9f1e-4024-98dd-de4cc6296ccf' // ST_DN_NHS_02
    ]
  },
  {
    id: '2f5eff5h-4h32-6828-1g0c-550fcf8e797e',
    name: 'Liên Chiểu District',
    latitude: 16.0592,
    longitude: 108.226,
    radiusMeters: 800,
    addressText: 'Liên Chiểu district and Ngã 3 Huệ area',
    stationIds: [
      'd9b309eb-5900-47a8-b2d0-4cd4e3603808' // ST_LC_003 - Liên Chiểu
    ]
  },
  {
    id: '3g6fgg6i-5i43-7939-2h1d-661gd9f9098f',
    name: 'Hải Châu District',
    latitude: 16.067,
    longitude: 108.22,
    radiusMeters: 600,
    addressText: 'Central Hải Châu district monitoring stations',
    stationIds: [
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890' // ST_DN_HC_01 - Trạm Quan Trắc Hải Châu
    ]
  },
  {
    id: '4h7ghh7j-6j54-8040-3i2e-772he0ga010g',
    name: 'Liên Trì & Thanh Hà',
    latitude: 16.048,
    longitude: 108.215,
    radiusMeters: 700,
    addressText: 'Liên Trì and Thanh Hà bridge areas',
    stationIds: [
      'b2c3d4e5-f6g7-8901-bcde-f23456789012', // ST_DN_LT_01 - Trạm Quan Trắc Liên Trì
      'c3d4e5f6-g7h8-9012-cdef-345678901234' // ST_DN_TH_01 - Trạm Quan Trắc Thanh Hà
    ]
  },
  {
    id: '5i8hii8k-7k65-9151-4j3f-883if1hb121h',
    name: 'Bình Thuận & Cẩm Chế',
    latitude: 16.042,
    longitude: 108.225,
    radiusMeters: 750,
    addressText: 'Bình Thuận and Cẩm Chế bridge areas',
    stationIds: [
      'd4e5f6g7-h8i9-0123-def0-456789012345', // ST_DN_BT_01 - Trạm Quan Trắc Bình Thuận
      'e5f6g7h8-i9j0-1234-ef01-567890123456' // ST_DN_CC_01 - Trạm Quan Trắc Cẩm Chế
    ]
  }
];

// -------- Stations --------
export const mockStations: Array<{
  id: UUID;
  code: string;
  name: string;
  locationDesc?: string;
  latitude?: number;
  longitude?: number;
  roadName?: string;
  direction?: string;
  status?: string;
  thresholdWarning?: number | null;
  thresholdCritical?: number | null;
  installedAt?: string | null;
  lastSeenAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}> = [
  {
    id: '550e8400-e29b-41d4-a716-446655440021',
    code: 'ST002',
    name: 'Trạm Trần Phú',
    locationDesc: 'Đường Trần Phú, quận Hải Châu',
    latitude: 16.06,
    longitude: 108.23,
    roadName: 'Đường Trần Phú',
    direction: 'downstream',
    status: 'active',
    thresholdWarning: 2.0,
    thresholdCritical: 3.0,
    installedAt: null,
    lastSeenAt: null,
    createdAt: '2026-01-17T14:58:10.504176Z',
    updatedAt: '2026-01-17T14:58:10.504176Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440020',
    code: 'ST001',
    name: 'Trạm Bạch Đằng',
    locationDesc: 'Gần cầu Rồng, đường Bạch Đằng',
    latitude: 16.0544,
    longitude: 108.2225,
    roadName: 'Đường Bạch Đằng',
    direction: 'upstream',
    status: 'active',
    thresholdWarning: 2.5,
    thresholdCritical: 3.5,
    installedAt: null,
    lastSeenAt: null,
    createdAt: '2026-01-17T14:58:10.504176Z',
    updatedAt: '2026-01-17T14:58:10.504176Z'
  },
  {
    id: 'c9c3203c-70f5-444e-b3cd-16160de0ce28',
    code: 'ST_DN_NHS_09',
    name: 'Trạm Quan Trắc Giao Thông Ngũ Hành Sơn',
    locationDesc: 'Nằm ở gần cầu Tiên Sơn khu Chương Dương',
    latitude: 16.03552,
    longitude: 108.23785,
    roadName: 'Đường Chương Dương',
    direction: 'upstream',
    status: 'active',
    thresholdWarning: null,
    thresholdCritical: null,
    installedAt: null,
    lastSeenAt: null,
    createdAt: '2026-01-17T06:09:38.280386Z',
    updatedAt: '2026-01-17T09:10:53.953152Z'
  },
  {
    id: 'd9b309eb-5900-47a8-b2d0-4cd4e3603808',
    code: 'ST_LC_003',
    name: 'Liên Chiểu',
    locationDesc: 'Great',
    latitude: 16.0592,
    longitude: 108.226,
    roadName: 'Ngã 3 Huệ',
    direction: 'Về phía cầu Sông Hàn ',
    status: 'active',
    thresholdWarning: 0.5,
    thresholdCritical: 1.2,
    installedAt: '2026-01-13T10:00:00+00:00',
    lastSeenAt: null,
    createdAt: '2026-01-17T05:59:27.052966Z',
    updatedAt: '2026-01-17T06:03:42.461027Z'
  },
  {
    id: 'c02d4c29-338f-4efd-b2f9-d2f5df7913b2',
    code: 'ST_DN_NHS_08',
    name: 'Trạm Quan Trắc Giao Thông Ngũ Hành Sơn',
    locationDesc: 'Nằm ở gần cầu Tiên Sơn khu Chương Dương',
    latitude: 16.03552,
    longitude: 108.23785,
    roadName: 'Đường Chương Dương',
    direction: 'upstream',
    status: 'offline',
    thresholdWarning: null,
    thresholdCritical: null,
    installedAt: null,
    lastSeenAt: null,
    createdAt: '2026-01-17T06:09:34.304434Z',
    updatedAt: '2026-01-17T06:09:34.304435Z'
  },
  {
    id: '4d616976-804e-4c6b-9094-8db53254a490',
    code: 'ST_DN_NHS_07',
    name: 'Trạm Quan Trắc Giao Thông Ngũ Hành Sơn',
    locationDesc: 'Nằm ở gần cầu Tiên Sơn khu Chương Dương',
    latitude: 16.03552,
    longitude: 108.23785,
    roadName: 'Đường Chương Dương',
    direction: 'upstream',
    status: 'offline',
    thresholdWarning: null,
    thresholdCritical: null,
    installedAt: null,
    lastSeenAt: null,
    createdAt: '2026-01-17T06:09:29.85696Z',
    updatedAt: '2026-01-17T06:09:29.85696Z'
  },
  {
    id: 'f6a6a80f-4d06-4d85-b3ec-02dd8e4a3d80',
    code: 'ST_DN_NHS_06',
    name: 'Trạm Quan Trắc Giao Thông Ngũ Hành Sơn',
    locationDesc: 'Nằm ở gần cầu Tiên Sơn khu Chương Dương',
    latitude: 16.03552,
    longitude: 108.23785,
    roadName: 'Đường Chương Dương',
    direction: 'upstream',
    status: 'offline',
    thresholdWarning: null,
    thresholdCritical: null,
    installedAt: null,
    lastSeenAt: null,
    createdAt: '2026-01-17T06:09:26.053174Z',
    updatedAt: '2026-01-17T06:09:26.053175Z'
  },
  {
    id: 'b615e406-36e0-4715-a7af-77f474c887fe',
    code: 'ST_DN_NHS_05',
    name: 'Trạm Quan Trắc Giao Thông Ngũ Hành Sơn',
    locationDesc: 'Nằm ở gần cầu Tiên Sơn khu Chương Dương',
    latitude: 16.03552,
    longitude: 108.23785,
    roadName: 'Đường Chương Dương',
    direction: 'upstream',
    status: 'offline',
    thresholdWarning: null,
    thresholdCritical: null,
    installedAt: null,
    lastSeenAt: null,
    createdAt: '2026-01-17T06:09:22.268188Z',
    updatedAt: '2026-01-17T06:09:22.268188Z'
  },
  {
    id: '5035dcd5-e14c-48d2-9495-149ae884f4c6',
    code: 'ST_DN_NHS_04',
    name: 'Trạm Quan Trắc Giao Thông Ngũ Hành Sơn',
    locationDesc: 'Nằm ở gần cầu Tiên Sơn khu Chương Dương',
    latitude: 16.03552,
    longitude: 108.23785,
    roadName: 'Đường Chương Dương',
    direction: 'upstream',
    status: 'offline',
    thresholdWarning: null,
    thresholdCritical: null,
    installedAt: null,
    lastSeenAt: null,
    createdAt: '2026-01-17T06:09:18.806635Z',
    updatedAt: '2026-01-17T06:09:18.806635Z'
  },
  {
    id: 'c10bf947-be92-49fb-ab6f-50eb9a49f93b',
    code: 'ST_DN_NHS_03',
    name: 'Trạm Quan Trắc Giao Thông Ngũ Hành Sơn',
    locationDesc: 'Nằm ở gần cầu Tiên Sơn khu Chương Dương',
    latitude: 16.03552,
    longitude: 108.23785,
    roadName: 'Đường Chương Dương',
    direction: 'upstream',
    status: 'offline',
    thresholdWarning: null,
    thresholdCritical: null,
    installedAt: null,
    lastSeenAt: null,
    createdAt: '2026-01-17T06:09:13.408909Z',
    updatedAt: '2026-01-17T06:09:13.40891Z'
  },
  {
    id: '872abbd5-9f1e-4024-98dd-de4cc6296ccf',
    code: 'ST_DN_NHS_02',
    name: 'Trạm Quan Trắc Giao Thông Ngũ Hành Sơn',
    locationDesc: 'Nằm ở gần cầu Tiên Sơn khu Chương Dương',
    latitude: 16.03552,
    longitude: 108.23785,
    roadName: 'Đường Chương Dương',
    direction: 'upstream',
    status: 'offline',
    thresholdWarning: null,
    thresholdCritical: null,
    installedAt: null,
    lastSeenAt: null,
    createdAt: '2026-01-17T06:09:08.652734Z',
    updatedAt: '2026-01-17T06:09:08.652735Z'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    code: 'ST_DN_HC_01',
    name: 'Trạm Quan Trắc Hải Châu',
    locationDesc: 'Khu vực trung tâm quận Hải Châu',
    latitude: 16.067,
    longitude: 108.22,
    roadName: 'Đường Nguyễn Văn Linh',
    direction: 'bidirectional',
    status: 'active',
    thresholdWarning: 1.8,
    thresholdCritical: 2.8,
    installedAt: '2026-01-15T08:00:00+00:00',
    lastSeenAt: null,
    createdAt: '2026-01-17T05:45:12.123456Z',
    updatedAt: '2026-01-17T05:45:12.123457Z'
  },
  {
    id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    code: 'ST_DN_LT_01',
    name: 'Trạm Quan Trắc Liên Trì',
    locationDesc: 'Nằm ở khu vực Liên Trì, Đà Nẵng',
    latitude: 16.048,
    longitude: 108.215,
    roadName: 'Đường Liên Trì',
    direction: 'downstream',
    status: 'active',
    thresholdWarning: 1.5,
    thresholdCritical: 2.5,
    installedAt: '2026-01-14T12:30:00+00:00',
    lastSeenAt: null,
    createdAt: '2026-01-17T05:30:45.678901Z',
    updatedAt: '2026-01-17T05:30:45.678902Z'
  },
  {
    id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
    code: 'ST_DN_TH_01',
    name: 'Trạm Quan Trắc Thanh Hà',
    locationDesc: 'Khu vực cầu Thanh Hà, Đà Nẵng',
    latitude: 16.052,
    longitude: 108.21,
    roadName: 'Đường Thanh Hà',
    direction: 'upstream',
    status: 'offline',
    thresholdWarning: null,
    thresholdCritical: null,
    installedAt: null,
    lastSeenAt: null,
    createdAt: '2026-01-17T05:15:23.456789Z',
    updatedAt: '2026-01-17T05:15:23.456790Z'
  },
  {
    id: 'd4e5f6g7-h8i9-0123-def0-456789012345',
    code: 'ST_DN_BT_01',
    name: 'Trạm Quan Trắc Bình Thuận',
    locationDesc: 'Nằm ở khu vực Bình Thuận, Đà Nẵng',
    latitude: 16.042,
    longitude: 108.225,
    roadName: 'Đường Bình Thuận',
    direction: 'bidirectional',
    status: 'active',
    thresholdWarning: 2.2,
    thresholdCritical: 3.2,
    installedAt: '2026-01-16T14:20:00+00:00',
    lastSeenAt: null,
    createdAt: '2026-01-17T05:00:34.567890Z',
    updatedAt: '2026-01-17T05:00:34.567891Z'
  },
  {
    id: 'e5f6g7h8-i9j0-1234-ef01-567890123456',
    code: 'ST_DN_CC_01',
    name: 'Trạm Quan Trắc Cẩm Chế',
    locationDesc: 'Khu vực cầu Cẩm Chế, Đà Nẵng',
    latitude: 16.028,
    longitude: 108.24,
    roadName: 'Đường Cẩm Chế',
    direction: 'downstream',
    status: 'active',
    thresholdWarning: 1.0,
    thresholdCritical: 2.0,
    installedAt: '2026-01-13T09:45:00+00:00',
    lastSeenAt: null,
    createdAt: '2026-01-17T04:45:56.789012Z',
    updatedAt: '2026-01-17T04:45:56.789013Z'
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
  return acc % 1000000; // Ensure consistent seeding across different UUID lengths
}

function severityFromCm(v: number, stationId?: UUID): FloodSeverity {
  // Get station-specific thresholds
  const station = mockStations.find((s) => s.id === stationId);

  // Convert cm to meters for threshold comparison (thresholds are in meters)
  const vMeters = v / 100;

  // Check station-specific thresholds if they exist
  if (
    station?.thresholdCritical !== null &&
    station?.thresholdCritical !== undefined &&
    vMeters >= station.thresholdCritical
  ) {
    return 'critical';
  }
  if (
    station?.thresholdWarning !== null &&
    station?.thresholdWarning !== undefined &&
    vMeters >= station.thresholdWarning
  ) {
    return 'warning';
  }

  // Fallback to default thresholds if station has no thresholds or null values
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
  return {
    id: st.id,
    code: st.code,
    name: st.name,
    locationDesc: st.locationDesc,
    latitude: st.latitude,
    longitude: st.longitude,
    roadName: st.roadName,
    direction: st.direction,
    status: st.status,
    thresholdWarning: st.thresholdWarning,
    thresholdCritical: st.thresholdCritical,
    installedAt: st.installedAt,
    lastSeenAt: st.lastSeenAt,
    createdAt: st.createdAt,
    updatedAt: st.updatedAt
  };
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
      severity: severityFromCm(v, stationId)
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
      peakSeverity: severityFromCm(max, args.stationId)
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
