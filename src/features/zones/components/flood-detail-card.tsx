'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/common';
import { AlertTriangle, Droplets, Clock, Activity, MapPin } from 'lucide-react';
import type { FloodStationProperties } from '@/features/zones/api/flood-severity.api';

export type FloodFeatureProps = {
  properties: FloodStationProperties;
  onClose: () => void;
};

export function FloodDetailCard({ properties, onClose }: FloodFeatureProps) {
  const severityKey =
    properties.severity ??
    (properties.severityLevel === 3
      ? 'critical'
      : properties.severityLevel === 2
        ? 'warning'
        : properties.severityLevel === 1
          ? 'caution'
          : 'safe');

  const severityConfig: Record<
    string,
    {
      label: string;
      color: string;
      bg: string;
      softBg: string;
      icon: React.ReactNode;
    }
  > = {
    critical: {
      label: properties.alertLevel ?? 'CRITICAL',
      color: 'text-red-600',
      bg: 'bg-red-500',
      softBg: 'bg-red-50',
      icon: null
    },
    warning: {
      label: properties.alertLevel ?? 'WARNING',
      color: 'text-orange-600',
      bg: 'bg-orange-500',
      softBg: 'bg-orange-50',
      icon: <AlertTriangle className='mr-1 h-3 w-3' />
    },
    caution: {
      label: properties.alertLevel ?? 'CAUTION',
      color: 'text-yellow-600',
      bg: 'bg-yellow-500',
      softBg: 'bg-yellow-50',
      icon: <Activity className='mr-1 h-3 w-3' />
    },
    safe: {
      label: properties.alertLevel ?? 'SAFE',
      color: 'text-emerald-600',
      bg: 'bg-emerald-500',
      softBg: 'bg-emerald-50',
      icon: <Droplets className='mr-1 h-3 w-3' />
    },
    unknown: {
      label: properties.alertLevel ?? 'NO DATA',
      color: 'text-slate-600',
      bg: 'bg-slate-400',
      softBg: 'bg-slate-50',
      icon: <Droplets className='mr-1 h-3 w-3' />
    }
  };

  const config = severityConfig[severityKey] ?? severityConfig.unknown;
  const displayStationCode = properties.stationCode ?? properties.code ?? 'N/A';
  const unit = properties.unit ?? 'cm';

  const formatNumber = (value: number | null | undefined, digits = 1) => {
    if (value === null || value === undefined || !Number.isFinite(value))
      return '--';
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(digits);
  };

  // Format date
  const formattedDate = properties.measuredAt
    ? new Date(properties.measuredAt).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      })
    : 'N/A';

  const resolvedStationId =
    properties.stationId ??
    properties.id ??
    properties.stationCode ??
    properties.code ??
    properties.stationName;

  return (
    <div className='pointer-events-auto w-full max-w-xs'>
      <Card className='pointer-events-auto overflow-hidden rounded-2xl border-none bg-white/95 shadow-xl backdrop-blur-md'>
        {/* Header */}
        <div className='p-4 pb-2'>
          <div className='flex items-start justify-between'>
            <div className='min-w-0 flex-1'>
              <h2 className='text-lg leading-tight font-bold text-slate-800'>
                {properties.stationName || `Trạm ${displayStationCode}`}
              </h2>
              <div className='mt-1.5 flex items-center gap-2 text-[10px]'>
                <span className='font-semibold text-slate-500'>
                  {displayStationCode}
                </span>
                <span className='text-slate-300'>•</span>
                <span className='font-medium text-slate-500 uppercase'>
                  {properties.stationStatus ?? 'unknown'}
                </span>
              </div>
            </div>
            <Button
              size='icon'
              variant='ghost'
              className='-mt-2 -mr-2 h-7 w-7 flex-shrink-0 rounded-full bg-slate-100 text-sm hover:bg-slate-200'
              onClick={onClose}
            >
              ×
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className='px-4 pb-4'>
          <div className='mb-3 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600'>
            <MapPin className='mt-0.5 h-4 w-4 text-slate-500' />
            <div className='min-w-0'>
              <div className='font-semibold text-slate-700'>
                {properties.roadName ?? 'Không có thông tin đường'}
              </div>
              <div className='text-slate-500'>
                {properties.locationDesc ?? 'Không có mô tả vị trí'}
              </div>
            </div>
          </div>

          <div className='mb-3 grid grid-cols-2 gap-3'>
            <div
              className={`rounded-xl border border-transparent ${config.softBg} p-3`}
            >
              <p className='text-[10px] text-slate-500'>Mực nước</p>
              <div className='flex items-baseline gap-1'>
                <span className={`text-3xl font-bold ${config.color}`}>
                  {formatNumber(properties.waterLevel, 1)}
                </span>
                <span className='text-xs font-semibold text-slate-500'>
                  {unit}
                </span>
              </div>
            </div>
            <div className='rounded-xl bg-slate-50 p-3'>
              <p className='text-[10px] text-slate-500'>Cảnh báo</p>
              <div className='mt-1 flex items-center gap-2'>
                <span className={`h-2.5 w-2.5 rounded-full ${config.bg}`} />
                <span className={`text-xs font-bold ${config.color}`}>
                  {config.label}
                </span>
              </div>
            </div>
          </div>

          <div className='mb-3 grid grid-cols-2 gap-3 text-xs text-slate-600'>
            <div className='rounded-xl bg-slate-50 p-3'>
              <div className='text-[10px] text-slate-500'>
                Chiều cao cảm biến
              </div>
              <div className='mt-1 text-lg font-semibold text-slate-800'>
                {formatNumber(properties.sensorHeight, 0)} {unit}
              </div>
            </div>
            <div className='rounded-xl bg-slate-50 p-3'>
              <div className='text-[10px] text-slate-500'>Khoảng cách</div>
              <div className='mt-1 text-lg font-semibold text-slate-800'>
                {formatNumber(properties.distance, 1)} {unit}
              </div>
            </div>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500'>
            <div className='flex items-center gap-2'>
              <Clock className='h-3.5 w-3.5' />
              <span>
                Cập nhật:{' '}
                <span className='font-medium text-slate-700'>
                  {formattedDate}
                </span>
              </span>
            </div>
            <Button
              asChild
              size='sm'
              className={`h-8 rounded-lg px-3 text-xs font-semibold text-white ${config.bg} hover:opacity-90`}
            >
              <Link
                href={
                  resolvedStationId
                    ? `/admin/flood-history?stationId=${resolvedStationId}`
                    : '/admin/flood-history'
                }
              >
                Chi tiết
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
