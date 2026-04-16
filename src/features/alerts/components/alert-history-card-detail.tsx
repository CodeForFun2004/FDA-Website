'use client';

import React from 'react';
import type { Alert } from '@/features/alerts/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconAlertTriangle,
  IconAlertOctagon,
  IconAlertCircle,
  IconInfoCircle,
  IconMapPin,
  IconClock,
  IconCheck,
  IconUser,
  IconGauge,
  IconChartLine,
  IconMap2,
  IconCalendar,
  IconBell,
  IconCircleCheckFilled,
  IconAlertCircleFilled
} from '@tabler/icons-react';
import { formatDate } from '@/libs/utils';

// ─── Severity config ───
type SeverityKey = Alert['severity'];

const SEVERITY_CONFIG: Record<
  SeverityKey,
  {
    gradient: string;
    bg: string;
    border: string;
    icon: typeof IconAlertTriangle;
    iconColor: string;
    label: string;
    badgeBg: string;
    badgeText: string;
    progressColor: string;
  }
> = {
  Critical: {
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800/50',
    icon: IconAlertOctagon,
    iconColor: 'text-white',
    label: 'Nguy hiểm',
    badgeBg: 'bg-red-500',
    badgeText: 'text-white',
    progressColor: 'bg-red-500'
  },
  High: {
    gradient: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800/50',
    icon: IconAlertTriangle,
    iconColor: 'text-white',
    label: 'Cao',
    badgeBg: 'bg-orange-500',
    badgeText: 'text-white',
    progressColor: 'bg-orange-500'
  },
  Medium: {
    gradient: 'from-yellow-500 to-amber-500',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800/50',
    icon: IconAlertCircle,
    iconColor: 'text-white',
    label: 'Trung bình',
    badgeBg: 'bg-yellow-500',
    badgeText: 'text-white',
    progressColor: 'bg-yellow-500'
  },
  Low: {
    gradient: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800/50',
    icon: IconInfoCircle,
    iconColor: 'text-white',
    label: 'Thấp',
    badgeBg: 'bg-blue-500',
    badgeText: 'text-white',
    progressColor: 'bg-blue-500'
  }
};

const STATUS_CONFIG: Record<
  Alert['status'],
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline';
    className: string;
    icon: typeof IconBell;
  }
> = {
  New: {
    label: 'Mới',
    variant: 'default',
    className:
      'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
    icon: IconBell
  },
  Acknowledged: {
    label: 'Đã xác nhận',
    variant: 'secondary',
    className:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    icon: IconAlertCircleFilled
  },
  Resolved: {
    label: 'Đã xử lý',
    variant: 'outline',
    className:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    icon: IconCircleCheckFilled
  }
};

// ─── Detail Row component ───
function DetailRow({
  icon: Icon,
  label,
  value,
  valueClassName
}: {
  icon: typeof IconClock;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className='flex items-start gap-3 py-2.5'>
      <div className='bg-muted/60 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg'>
        <Icon className='text-muted-foreground h-4 w-4' />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-muted-foreground/70 text-[11px] font-medium tracking-wider uppercase'>
          {label}
        </p>
        <p
          className={`text-foreground text-sm font-medium ${valueClassName ?? ''}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───
interface AlertHistoryCardDetailProps {
  alert: Alert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAcknowledge?: (alert: Alert) => void;
  onResolve?: (alert: Alert) => void;
}

export function AlertHistoryCardDetail({
  alert,
  open,
  onOpenChange,
  onAcknowledge,
  onResolve
}: AlertHistoryCardDetailProps) {
  if (!alert) return null;

  const config = SEVERITY_CONFIG[alert.severity];
  const statusConfig = STATUS_CONFIG[alert.status];
  const SeverityIcon = config.icon;
  const StatusIcon = statusConfig.icon;

  // Calculate sensor threshold percentage
  const thresholdPercent =
    alert.sensorValue && alert.thresholdValue
      ? Math.min(100, (alert.sensorValue / alert.thresholdValue) * 100)
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md overflow-hidden rounded-3xl border-0 p-0 shadow-2xl'>
        {/* ── Header with gradient ── */}
        <div className={`bg-gradient-to-br ${config.gradient} px-6 pt-6 pb-8`}>
          <DialogHeader className='space-y-3'>
            {/* Top row: badge + status */}
            <div className='flex items-center justify-between'>
              <Badge
                className={`${config.badgeBg} ${config.badgeText} gap-1.5 rounded-full border-0 px-3 py-1 text-[11px] font-bold tracking-wider uppercase shadow-lg`}
              >
                <SeverityIcon className='h-3.5 w-3.5' stroke={2.5} />
                {config.label}
              </Badge>
              <Badge
                variant={statusConfig.variant}
                className={`${statusConfig.className} gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold`}
              >
                <StatusIcon className='h-3 w-3' />
                {statusConfig.label}
              </Badge>
            </div>

            {/* Title */}
            <DialogTitle className='text-lg leading-tight font-bold text-white drop-shadow-sm'>
              {alert.title}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* ── Body ── */}
        <div className='space-y-5 px-6 pt-5 pb-6'>
          {/* Description card */}
          <div
            className={`rounded-2xl border ${config.border} ${config.bg} p-4`}
          >
            <p className='text-foreground/80 text-sm leading-relaxed'>
              {alert.description}
            </p>
          </div>

          {/* Sensor reading progress */}
          {thresholdPercent !== null && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-muted-foreground font-medium'>
                  Chỉ số hiện tại
                </span>
                <span className='text-foreground font-bold'>
                  {alert.sensorValue} {alert.sensorUnit}
                  <span className='text-muted-foreground font-normal'>
                    {' '}
                    / ngưỡng {alert.thresholdValue} {alert.sensorUnit}
                  </span>
                </span>
              </div>
              <div className='bg-muted/60 h-2 w-full overflow-hidden rounded-full'>
                <div
                  className={`h-full rounded-full ${config.progressColor} transition-all duration-700 ease-out`}
                  style={{ width: `${thresholdPercent}%` }}
                />
              </div>
              {thresholdPercent > 100 && (
                <p className='text-[11px] font-medium text-red-500'>
                  ⚠️ Đã vượt ngưỡng cho phép
                </p>
              )}
            </div>
          )}

          {/* Detail grid */}
          <div className='divide-border/50 divide-y'>
            <DetailRow
              icon={IconClock}
              label='Thời gian'
              value={formatDate(alert.timestamp)}
            />
            <DetailRow
              icon={IconMapPin}
              label='Trạm Quan Trắc'
              value={
                <span>
                  {alert.stationName}
                  <span className='text-muted-foreground block text-[12px] font-normal'>
                    {alert.stationAddress}
                  </span>
                </span>
              }
            />
            <DetailRow icon={IconMap2} label='Khu vực' value={alert.zone} />
            {alert.sensorType && (
              <DetailRow
                icon={IconGauge}
                label='Loại cảm biến'
                value={alert.sensorType}
              />
            )}
            {alert.coordinates && (
              <DetailRow
                icon={IconChartLine}
                label='Tọa độ'
                value={`${alert.coordinates[0].toFixed(4)}, ${alert.coordinates[1].toFixed(4)}`}
              />
            )}
            {alert.acknowledgedAt && (
              <DetailRow
                icon={IconUser}
                label='Xác nhận bởi'
                value={
                  <span>
                    {alert.acknowledgedBy || 'N/A'}
                    <span className='text-muted-foreground block text-[12px] font-normal'>
                      {formatDate(alert.acknowledgedAt)}
                    </span>
                  </span>
                }
              />
            )}
            {alert.resolvedAt && (
              <DetailRow
                icon={IconCalendar}
                label='Thời gian xử lý'
                value={formatDate(alert.resolvedAt)}
              />
            )}
          </div>

          {/* Action buttons */}
          {alert.status !== 'Resolved' && (
            <div className='flex gap-3 pt-2'>
              {alert.status === 'New' && (
                <Button
                  variant='outline'
                  className='flex-1 gap-2 rounded-xl font-semibold'
                  onClick={() => onAcknowledge?.(alert)}
                >
                  <IconCheck className='h-4 w-4' />
                  Xác nhận
                </Button>
              )}
              <Button
                className={`flex-1 gap-2 rounded-xl bg-gradient-to-r font-semibold ${config.gradient} text-white shadow-lg transition-shadow hover:shadow-xl`}
                onClick={() => onResolve?.(alert)}
              >
                <IconCircleCheckFilled className='h-4 w-4' />
                Đánh dấu đã xử lý
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
