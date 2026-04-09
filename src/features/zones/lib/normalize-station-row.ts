import type {
  StationExtended,
  StationStatus
} from '@/features/stations/types/station.type';

function pick<T = unknown>(
  raw: Record<string, unknown>,
  ...keys: string[]
): T | undefined {
  for (const k of keys) {
    const v = raw[k];
    if (v !== undefined && v !== null) return v as T;
  }
  return undefined;
}

function str(raw: Record<string, unknown>, ...keys: string[]): string {
  const v = pick(raw, ...keys);
  if (v === undefined || v === null) return '';
  return String(v);
}

function num(raw: Record<string, unknown>, ...keys: string[]): number | null {
  const v = pick(raw, ...keys);
  if (v === undefined || v === null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function bool(raw: Record<string, unknown>, ...keys: string[]): boolean | null {
  const v = pick(raw, ...keys);
  if (v === undefined || v === null) return null;
  if (typeof v === 'boolean') return v;
  return String(v).toLowerCase() === 'true';
}

/** Chuẩn hóa một dòng station từ GET /stations/stations (camelCase hoặc PascalCase). */
export function normalizeStationRow(raw: unknown): StationExtended | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = str(r, 'id', 'Id');
  const code = str(r, 'code', 'Code');
  const name = str(r, 'name', 'Name');
  if (!id || !code || !name) return null;

  const lat = num(r, 'latitude', 'Latitude');
  const lng = num(r, 'longitude', 'Longitude');
  if (lat == null || lng == null) return null;

  const statusRaw = (str(r, 'status', 'Status') || 'offline').toLowerCase();
  const status: StationStatus =
    statusRaw === 'online' ||
    statusRaw === 'offline' ||
    statusRaw === 'maintenance'
      ? statusRaw
      : 'offline';

  return {
    id,
    code,
    name,
    locationDesc:
      (pick(r, 'locationDesc', 'LocationDesc') as string | null) ?? null,
    latitude: lat,
    longitude: lng,
    roadName: (pick(r, 'roadName', 'RoadName') as string | null) ?? null,
    direction: (pick(r, 'direction', 'Direction') as string | null) ?? null,
    status,
    thresholdWarning: num(r, 'thresholdWarning', 'ThresholdWarning'),
    thresholdCritical: num(r, 'thresholdCritical', 'ThresholdCritical'),
    calibrationOffset: num(r, 'calibrationOffset', 'CalibrationOffset'),
    installedAt:
      (pick(r, 'installedAt', 'InstalledAt') as string | null) ?? null,
    lastSeenAt: (pick(r, 'lastSeenAt', 'LastSeenAt') as string | null) ?? null,
    createdAt: str(r, 'createdAt', 'CreatedAt') || new Date(0).toISOString(),
    updatedAt: str(r, 'updatedAt', 'UpdatedAt') || new Date(0).toISOString(),
    administrativeAreaId:
      (pick(r, 'administrativeAreaId', 'AdministrativeAreaId') as
        | string
        | null) ?? null,
    type: (pick(r, 'type', 'Type') as string | null) ?? null,
    isIncidentActive: bool(r, 'isIncidentActive', 'IsIncidentActive'),
    sensorHeight: num(r, 'sensorHeight', 'SensorHeight'),
    createdBy: (pick(r, 'createdBy', 'CreatedBy') as string | null) ?? null,
    updatedBy: (pick(r, 'updatedBy', 'UpdatedBy') as string | null) ?? null
  };
}

export function normalizeStationsPayload(raw: unknown): StationExtended[] {
  if (!raw || typeof raw !== 'object') return [];
  const o = raw as Record<string, unknown>;
  const list =
    (Array.isArray(o.stations) ? o.stations : null) ??
    (Array.isArray(o.Stations) ? o.Stations : null) ??
    (o.data &&
    typeof o.data === 'object' &&
    Array.isArray((o.data as any).stations)
      ? (o.data as any).stations
      : null) ??
    [];
  const out: StationExtended[] = [];
  for (const item of list) {
    const s = normalizeStationRow(item);
    if (s) out.push(s);
  }
  return out;
}
