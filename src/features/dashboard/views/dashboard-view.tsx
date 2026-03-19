// src/features/dashboard/views/DashboardView.tsx
'use client';

import React from 'react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useSensorReadings } from '@/features/sensors';
import { useAlerts, type Alert } from '@/features/alerts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingState,
  Button
} from '@/components/ui/common';
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
  Radio,
  AlertTriangle,
  MapPin,
  Plus,
  Droplets,
  ArrowUpRight
} from 'lucide-react';
import { formatDate } from '@/libs/utils';

// ===== Sub-components =====

type StatCardProps = {
  title: string;
  value: React.ReactNode;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
  bgClass
}: StatCardProps) => (
  <Card className='overflow-hidden'>
    <CardContent className='p-6'>
      <div className='flex items-center justify-between space-y-0 pb-2'>
        <div className={`rounded-xl p-3 ${bgClass}`}>
          <Icon className={`h-6 w-6 ${colorClass}`} />
        </div>
        <span className='flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700'>
          <ArrowUpRight className='mr-1 h-3 w-3' /> 12%
        </span>
      </div>
      <div className='mt-4'>
        <div className='text-3xl font-bold tracking-tight'>{value}</div>
        <p className='text-muted-foreground mt-1 text-sm font-medium'>
          {title}
        </p>
      </div>
    </CardContent>
  </Card>
);

function WaterTooltip({ active, label, payload }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className='bg-background rounded-xl border px-4 py-3 shadow-md'>
      <div className='text-foreground text-sm font-medium'>
        {formatDate(label)}
      </div>
      <div className='text-primary text-sm'>value : {payload[0].value}</div>
    </div>
  );
}

type AlertItemProps = {
  alert: Alert;
};

const AlertItem = ({ alert }: AlertItemProps) => (
  <div className='flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0'>
    <div
      className={`mt-1 rounded-full p-2 ${
        alert.severity === 'High'
          ? 'bg-red-100 text-red-600'
          : alert.severity === 'Medium'
            ? 'bg-orange-100 text-orange-600'
            : 'bg-yellow-100 text-yellow-600'
      }`}
    >
      <AlertTriangle className='h-4 w-4' />
    </div>

    <div className='flex-1 space-y-1'>
      <p className='text-foreground text-sm font-semibold'>{alert.message}</p>
      <p className='text-muted-foreground text-xs'>{alert.zone}</p>
    </div>

    <div className='text-muted-foreground text-xs font-medium whitespace-nowrap'>
      {new Date(alert.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}
    </div>
  </div>
);

// ===== Main View Component =====

export type DashboardViewProps = {
  onCreateAlert?: () => void;
  onAddDevice?: () => void;
};

export function DashboardView({
  onCreateAlert,
  onAddDevice
}: DashboardViewProps) {
  const { totalDevices, offlineDevices, activeAlerts, monitoredZones } =
    useDashboardStats();
  const { data: sensorData, isLoading: isLoadingSensors } = useSensorReadings();
  const { data: alerts, isLoading: isLoadingAlerts } = useAlerts();

  if (isLoadingSensors || isLoadingAlerts) return <LoadingState />;

  const chartData = sensorData ?? [];
  const alertList = alerts ?? [];

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div>
          <h1 className='text-foreground text-3xl font-bold tracking-tight'>
            Overview
          </h1>
          <p className='text-muted-foreground mt-1'>
            Real-time flood monitoring summary
          </p>
        </div>

        <div className='flex gap-3'>
          <Button
            variant='outline'
            className='rounded-full'
            onClick={onCreateAlert}
          >
            <Plus className='mr-2 h-4 w-4' /> Create Alert
          </Button>
          <Button
            className='rounded-full shadow-lg shadow-blue-500/20'
            onClick={onAddDevice}
          >
            <Plus className='mr-2 h-4 w-4' /> Add Device
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Active Devices'
          value={totalDevices}
          icon={Radio}
          colorClass='text-blue-600'
          bgClass='bg-blue-100 dark:bg-blue-900/30'
        />
        <StatCard
          title='Offline Devices'
          value={offlineDevices}
          icon={Activity}
          colorClass='text-red-600'
          bgClass='bg-red-100 dark:bg-red-900/30'
        />
        <StatCard
          title='Active Alerts'
          value={activeAlerts}
          icon={AlertTriangle}
          colorClass='text-orange-600'
          bgClass='bg-orange-100 dark:bg-orange-900/30'
        />
        <StatCard
          title='Monitored Zones'
          value={monitoredZones}
          icon={MapPin}
          colorClass='text-emerald-600'
          bgClass='bg-emerald-100 dark:bg-emerald-900/30'
        />
      </div>

      {/* Charts & Alerts */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4 border-none bg-gradient-to-br from-white to-slate-50 shadow-sm dark:from-slate-900 dark:to-slate-950'>
          <CardHeader>
            <CardTitle>Water Level Forecast</CardTitle>
            <p className='text-muted-foreground text-sm'>
              River Sensor A1 - Last 24 Hours
            </p>
          </CardHeader>

          <CardContent className='pl-0'>
            <div className='h-[350px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id='colorValue' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#2563eb' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#2563eb' stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray='3 3'
                    vertical={false}
                    className='stroke-muted/50'
                  />

                  <XAxis
                    dataKey='timestamp'
                    tickFormatter={(t) => new Date(t).getHours() + 'h'}
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

                  <Tooltip content={<WaterTooltip />} />

                  <Area
                    type='monotone'
                    dataKey='value'
                    stroke='#2563eb'
                    strokeWidth={3}
                    fillOpacity={1}
                    fill='url(#colorValue)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>

          <CardContent>
            <div className='space-y-6'>
              {alertList.slice(0, 4).map((alert: Alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className='grid gap-6 md:grid-cols-3'>
        <Card className='border-none bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20'>
          <CardContent className='p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-lg bg-white/20 p-2'>
                <Droplets className='h-5 w-5' />
              </div>
              <h4 className='font-semibold'>Rainfall Intensity</h4>
            </div>

            <div className='flex items-end gap-2'>
              <p className='text-4xl font-bold'>12</p>
              <p className='mb-1 text-lg opacity-80'>mm/hr</p>
            </div>

            <p className='mt-2 inline-block rounded-md bg-white/20 px-2 py-1 text-sm opacity-90'>
              Moderate Rain
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-lg bg-emerald-100 p-2'>
                <Activity className='h-5 w-5 text-emerald-600' />
              </div>
              <h4 className='text-foreground font-semibold'>Avg Water Level</h4>
            </div>

            <div className='flex items-end gap-2'>
              <p className='text-foreground text-4xl font-bold'>2.4</p>
              <p className='text-muted-foreground mb-1 text-lg'>meters</p>
            </div>

            <p className='mt-2 text-sm font-medium text-emerald-600'>
              Safe (Below 4.0m)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-lg bg-purple-100 p-2'>
                <MapPin className='h-5 w-5 text-purple-600' />
              </div>
              <h4 className='text-foreground font-semibold'>Safe Routes</h4>
            </div>

            <div className='flex items-end gap-2'>
              <p className='text-foreground text-4xl font-bold'>15</p>
              <p className='text-muted-foreground mb-1 text-lg'>Active</p>
            </div>

            <p className='text-muted-foreground mt-2 text-sm'>
              2 Blocked Routes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
