'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { getFloodForecast, getCurrentWeather } from '../api/open-meteo.api';
import {
  getFloodSeverityGeoJSON,
  type FloodStationProperties
} from '@/features/zones/api/flood-severity.api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button
} from '@/components/ui/common';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Activity,
  Droplets,
  MapPin,
  Waves,
  Map as MapIcon,
  Radio,
  WifiOff
} from 'lucide-react';
import Link from 'next/link';

// ── Helpers ──────────────────────────────────────────────────────────

function rainfallLabel(mm: number) {
  if (mm <= 0) return 'No Rain';
  if (mm < 2.5) return 'Light Rain';
  if (mm < 7.6) return 'Moderate Rain';
  return 'Heavy Rain';
}

function humidityLabel(pct: number) {
  if (pct < 30) return 'Dry';
  if (pct < 60) return 'Comfortable';
  if (pct < 80) return 'Humid';
  return 'Very Humid';
}

function dischargeLabel(avg: number) {
  if (avg < 50) return 'Low Flow';
  if (avg < 200) return 'Normal Flow';
  if (avg < 500) return 'High Flow';
  return 'Flood Risk';
}

const SEVERITY_STYLES: Record<
  string,
  { bg: string; text: string; ring: string }
> = {
  critical: {
    bg: 'bg-gradient-to-br from-red-500 to-rose-600',
    text: 'text-white',
    ring: 'ring-red-500/20'
  },
  alarm: {
    bg: 'bg-gradient-to-br from-orange-500 to-amber-600',
    text: 'text-white',
    ring: 'ring-orange-500/20'
  },
  warning: {
    bg: 'bg-gradient-to-br from-yellow-500 to-amber-500',
    text: 'text-white',
    ring: 'ring-yellow-500/20'
  },
  safe: {
    bg: 'bg-gradient-to-br from-emerald-500 to-green-600',
    text: 'text-white',
    ring: 'ring-emerald-500/20'
  },
  unknown: {
    bg: 'bg-gradient-to-br from-slate-400 to-slate-500',
    text: 'text-white',
    ring: 'ring-slate-400/20'
  }
};

// ── Skeleton Loaders ─────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className='space-y-8'>
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div className='space-y-2'>
          <Skeleton className='h-9 w-48' />
          <Skeleton className='h-5 w-72' />
        </div>
        <div className='flex gap-3'>
          <Skeleton className='h-10 w-36 rounded-full' />
          <Skeleton className='h-10 w-36 rounded-full' />
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className='overflow-hidden'>
            <CardContent className='p-6'>
              <Skeleton className='h-12 w-12 rounded-xl' />
              <div className='mt-4 space-y-2'>
                <Skeleton className='h-8 w-20' />
                <Skeleton className='h-4 w-28' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <Skeleton className='h-6 w-52' />
            <Skeleton className='mt-1 h-4 w-40' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-[350px] w-full rounded-lg' />
          </CardContent>
        </Card>
        <Card className='col-span-3'>
          <CardHeader>
            <Skeleton className='h-6 w-44' />
          </CardHeader>
          <CardContent className='space-y-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='flex items-start gap-3'>
                <Skeleton className='h-9 w-9 rounded-full' />
                <div className='flex-1 space-y-1.5'>
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-3 w-1/2' />
                </div>
                <Skeleton className='h-3 w-10' />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className='space-y-4 p-6'>
              <div className='flex items-center gap-3'>
                <Skeleton className='h-9 w-9 rounded-lg' />
                <Skeleton className='h-5 w-32' />
              </div>
              <Skeleton className='h-10 w-24' />
              <Skeleton className='h-4 w-20' />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────

type StatCardProps = {
  title: string;
  value: React.ReactNode;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  isError?: boolean;
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
  bgClass,
  isError
}: StatCardProps) => (
  <Card className='overflow-hidden'>
    <CardContent className='p-6'>
      <div className='flex items-center justify-between space-y-0 pb-2'>
        <div className={`rounded-xl p-3 ${bgClass}`}>
          <Icon className={`h-6 w-6 ${colorClass}`} />
        </div>
      </div>
      <div className='mt-4'>
        <div className='text-3xl font-bold tracking-tight'>
          {isError ? (
            <span className='text-muted-foreground text-xl'>N/A</span>
          ) : (
            value
          )}
        </div>
        <p className='text-muted-foreground mt-1 text-sm font-medium'>
          {title}
        </p>
      </div>
    </CardContent>
  </Card>
);

function DischargeTooltip({ active, label, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className='bg-background rounded-xl border px-4 py-3 shadow-md'>
      <div className='text-foreground text-sm font-medium'>{label}</div>
      <div className='text-primary text-sm'>
        {payload[0].value?.toFixed(1)} m&#179;/s
      </div>
    </div>
  );
}

function StationStatusItem({ station }: { station: FloodStationProperties }) {
  const severity = station.severity ?? 'unknown';
  const style = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.unknown;

  return (
    <div className='hover:bg-accent/50 flex cursor-pointer items-start gap-3 rounded-xl p-2 transition-colors'>
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.bg} ring-3 ${style.ring} shadow-md`}
      >
        <Waves className={`h-4 w-4 ${style.text}`} />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-foreground line-clamp-1 text-sm leading-snug font-semibold'>
          {station.waterLevel != null
            ? `${station.waterLevel.toFixed(2)} ${station.unit}`
            : 'No data'}{' '}
          — {severity}
        </p>
        <p className='text-muted-foreground line-clamp-1 text-xs'>
          {station.stationName} ({station.stationCode})
        </p>
      </div>
      {station.measuredAt && (
        <div className='text-muted-foreground mt-0.5 text-[11px] font-medium whitespace-nowrap'>
          {new Date(station.measuredAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )}
    </div>
  );
}

// ── Main View ────────────────────────────────────────────────────────

export type DashboardViewProps = {
  onViewFloodMap?: () => void;
  onViewStations?: () => void;
};

export function DashboardView({
  onViewFloodMap,
  onViewStations
}: DashboardViewProps) {
  const stats = useDashboardStats();

  const floodForecastQ = useQuery({
    queryKey: ['dashboard-flood-forecast'],
    queryFn: getFloodForecast,
    staleTime: 5 * 60_000,
    retry: 2
  });

  const weatherQ = useQuery({
    queryKey: ['dashboard-current-weather'],
    queryFn: getCurrentWeather,
    staleTime: 5 * 60_000,
    retry: 2
  });

  const DA_NANG_BOUNDS = '107.9,15.9,108.4,16.2';

  const floodStatusQ = useQuery({
    queryKey: ['dashboard-flood-status'],
    queryFn: () =>
      getFloodSeverityGeoJSON({ bounds: DA_NANG_BOUNDS, zoom: 12 }),
    staleTime: 60_000,
    retry: 2
  });

  const chartData = React.useMemo(() => {
    const daily = floodForecastQ.data?.daily;
    if (!daily) return [];
    return daily.time.map((date, i) => ({
      date,
      discharge: daily.river_discharge[i] ?? 0
    }));
  }, [floodForecastQ.data]);

  const avgDischarge = React.useMemo(() => {
    const vals = chartData.map((d) => d.discharge).filter((v) => v > 0);
    if (!vals.length) return 0;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  }, [chartData]);

  const stationStatusItems: FloodStationProperties[] = React.useMemo(() => {
    const features = floodStatusQ.data?.features ?? [];
    return features
      .map((f) => f.properties)
      .filter((p) => p.waterLevel != null)
      .sort((a, b) => (b.severityLevel ?? 0) - (a.severityLevel ?? 0))
      .slice(0, 6);
  }, [floodStatusQ.data]);

  const isLoading =
    stats.isLoading || floodForecastQ.isLoading || weatherQ.isLoading;

  if (isLoading) return <DashboardSkeleton />;

  const weather = weatherQ.data?.current;
  const precipitation = weather?.precipitation ?? 0;
  const humidity = weather?.relative_humidity_2m ?? 0;

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div>
          <h1 className='text-foreground text-3xl font-bold tracking-tight'>
            Overview
          </h1>
          <p className='text-muted-foreground mt-1'>
            Real-time flood monitoring for Da Nang region
          </p>
        </div>
        <div className='flex gap-3'>
          <Link href='/admin/zones'>
            <Button
              variant='outline'
              className='rounded-full'
              onClick={onViewFloodMap}
            >
              <MapIcon className='mr-2 h-4 w-4' /> View Flood Map
            </Button>
          </Link>
          <Link href='/admin/stations'>
            <Button
              className='rounded-full shadow-lg shadow-blue-500/20'
              onClick={onViewStations}
            >
              <Activity className='mr-2 h-4 w-4' /> View Stations
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Total Stations'
          value={stats.totalStations}
          icon={Radio}
          colorClass='text-indigo-600'
          bgClass='bg-indigo-100 dark:bg-indigo-900/30'
          isError={stats.errors.totalStations}
        />
        <StatCard
          title='Online Stations'
          value={stats.onlineStations}
          icon={Activity}
          colorClass='text-blue-600'
          bgClass='bg-blue-100 dark:bg-blue-900/30'
          isError={stats.errors.onlineStations}
        />
        <StatCard
          title='Offline Stations'
          value={stats.offlineStations}
          icon={WifiOff}
          colorClass='text-red-600'
          bgClass='bg-red-100 dark:bg-red-900/30'
          isError={stats.errors.offlineStations}
        />
        <StatCard
          title='Administrative Areas'
          value={stats.administrativeAreas}
          icon={MapPin}
          colorClass='text-emerald-600'
          bgClass='bg-emerald-100 dark:bg-emerald-900/30'
          isError={stats.errors.administrativeAreas}
        />
      </div>

      {/* Chart & Flood Readings */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4 border-none bg-gradient-to-br from-white to-slate-50 shadow-sm dark:from-slate-900 dark:to-slate-950'>
          <CardHeader>
            <CardTitle>River Discharge Forecast</CardTitle>
            <p className='text-muted-foreground text-sm'>
              Vu Gia — Thu Bon Basin, 14 Day Outlook (m&#179;/s)
            </p>
          </CardHeader>
          <CardContent className='pl-0'>
            {floodForecastQ.isError ? (
              <div className='flex h-[350px] items-center justify-center'>
                <p className='text-muted-foreground text-sm'>
                  Failed to load forecast data.
                </p>
              </div>
            ) : (
              <div className='h-[350px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id='colorDischarge'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor='#2563eb'
                          stopOpacity={0.3}
                        />
                        <stop
                          offset='95%'
                          stopColor='#2563eb'
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      vertical={false}
                      className='stroke-muted/50'
                    />
                    <XAxis
                      dataKey='date'
                      tickFormatter={(d: string) => {
                        const dt = new Date(d);
                        return `${dt.getDate()}/${dt.getMonth() + 1}`;
                      }}
                      className='text-muted-foreground text-xs'
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                    />
                    <YAxis
                      className='text-muted-foreground text-xs'
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                    />
                    <Tooltip content={<DischargeTooltip />} />
                    <Area
                      type='monotone'
                      dataKey='discharge'
                      stroke='#2563eb'
                      strokeWidth={3}
                      fillOpacity={1}
                      fill='url(#colorDischarge)'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Station Flood Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {floodStatusQ.isLoading ? (
                <div className='space-y-4'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className='flex items-start gap-3'>
                      <Skeleton className='h-9 w-9 rounded-full' />
                      <div className='flex-1 space-y-1.5'>
                        <Skeleton className='h-4 w-3/4' />
                        <Skeleton className='h-3 w-1/2' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : floodStatusQ.isError ? (
                <p className='text-muted-foreground text-sm'>
                  Failed to load station status.
                </p>
              ) : stationStatusItems.length > 0 ? (
                stationStatusItems.map((s) => (
                  <StationStatusItem
                    key={s.stationId ?? s.stationCode}
                    station={s}
                  />
                ))
              ) : (
                <p className='text-muted-foreground text-sm'>
                  No station data available.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className='grid gap-6 md:grid-cols-3'>
        {/* Rainfall */}
        <Card className='border-none bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20'>
          <CardContent className='p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-lg bg-white/20 p-2'>
                <Droplets className='h-5 w-5' />
              </div>
              <h4 className='font-semibold'>Rainfall Intensity</h4>
            </div>
            <div className='flex items-end gap-2'>
              <p className='text-4xl font-bold'>
                {weatherQ.isError ? '--' : precipitation.toFixed(1)}
              </p>
              <p className='mb-1 text-lg opacity-80'>mm/hr</p>
            </div>
            <p className='mt-2 inline-block rounded-md bg-white/20 px-2 py-1 text-sm opacity-90'>
              {weatherQ.isError ? 'Unavailable' : rainfallLabel(precipitation)}
            </p>
          </CardContent>
        </Card>

        {/* Avg Discharge */}
        <Card>
          <CardContent className='p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-lg bg-emerald-100 p-2'>
                <Waves className='h-5 w-5 text-emerald-600' />
              </div>
              <h4 className='text-foreground font-semibold'>
                Avg River Discharge
              </h4>
            </div>
            <div className='flex items-end gap-2'>
              <p className='text-foreground text-4xl font-bold'>
                {floodForecastQ.isError ? '--' : avgDischarge.toFixed(1)}
              </p>
              <p className='text-muted-foreground mb-1 text-lg'>m&#179;/s</p>
            </div>
            <p className='mt-2 text-sm font-medium text-emerald-600'>
              {floodForecastQ.isError
                ? 'Unavailable'
                : dischargeLabel(avgDischarge)}
            </p>
          </CardContent>
        </Card>

        {/* Humidity */}
        <Card>
          <CardContent className='p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-lg bg-purple-100 p-2'>
                <Droplets className='h-5 w-5 text-purple-600' />
              </div>
              <h4 className='text-foreground font-semibold'>Humidity</h4>
            </div>
            <div className='flex items-end gap-2'>
              <p className='text-foreground text-4xl font-bold'>
                {weatherQ.isError ? '--' : humidity.toFixed(0)}
              </p>
              <p className='text-muted-foreground mb-1 text-lg'>%</p>
            </div>
            <p className='text-muted-foreground mt-2 text-sm'>
              {weatherQ.isError ? 'Unavailable' : humidityLabel(humidity)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
