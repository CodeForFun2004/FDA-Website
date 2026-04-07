// src/features/dashboard/views/DashboardView.tsx
'use client';

import React from 'react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useAlerts, type Alert } from '@/features/alerts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingState,
  Button
} from '@/components/ui/common';
import { AlertTriangle, MapPin, Plus } from 'lucide-react';

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
};

export function DashboardView({ onCreateAlert }: DashboardViewProps) {
  const { activeAlerts, monitoredZones } = useDashboardStats();
  const { data: alerts, isLoading: isLoadingAlerts } = useAlerts();

  if (isLoadingAlerts) return <LoadingState />;

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
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid gap-6 md:grid-cols-2'>
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

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>

        <CardContent>
          <div className='space-y-6'>
            {alertList.slice(0, 8).map((alert: Alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
