'use client';

import React from 'react';
import { Card, Button } from '@/components/ui/common';
import {
  AlertTriangle,
  Droplets,
  Navigation,
  Clock,
  Activity
} from 'lucide-react';
import type { FloodStationProperties } from '@/features/zones/api/floodSeverity';

export type FloodFeatureProps = {
  properties: FloodStationProperties;
  onClose: () => void;
};

export function FloodDetailCard({ properties, onClose }: FloodFeatureProps) {
  // Config color based on severityLevel
  // 0: Safe (Green), 1: Caution (Yellow), 2: Warning (Orange), 3: Critical (Red)
  const getSeverityConfig = (level: number) => {
    switch (level) {
      case 3:
        return {
          label: 'Nguy cơ cao',
          color: 'text-red-600',
          bg: 'bg-red-500',
          ping: true,
          icon: null
        };
      case 2:
        return {
          label: 'Cảnh báo',
          color: 'text-orange-600',
          bg: 'bg-orange-500',
          ping: false,
          icon: <AlertTriangle className='mr-1 h-3 w-3' />
        };
      case 1:
        return {
          label: 'Chú ý',
          color: 'text-yellow-600',
          bg: 'bg-yellow-500',
          ping: false,
          icon: <Activity className='mr-1 h-3 w-3' />
        };
      default:
        return {
          label: 'An toàn',
          color: 'text-emerald-600',
          bg: 'bg-emerald-500',
          ping: false,
          icon: <Droplets className='mr-1 h-3 w-3' />
        };
    }
  };

  const config = getSeverityConfig(properties.severityLevel ?? 0);

  // Format date
  const formattedDate = properties.measuredAt
    ? new Date(properties.measuredAt).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      })
    : 'N/A';

  return (
    <div className='pointer-events-auto w-full max-w-xs'>
      <Card className='pointer-events-auto overflow-hidden rounded-2xl border-none bg-white/95 shadow-xl backdrop-blur-md'>
        {/* Header */}
        <div className='p-4 pb-2'>
          <div className='flex items-start justify-between'>
            <div className='min-w-0 flex-1'>
              <h2 className='text-lg leading-tight font-bold text-slate-800'>
                {properties.stationName || `Trạm ${properties.stationCode}`}
              </h2>
              <div className='mt-1.5 flex items-center gap-2'>
                <span
                  className={`flex items-center text-[10px] font-bold ${config.color}`}
                >
                  {config.ping ? (
                    <span className='relative mr-1 flex h-2 w-2'>
                      <span
                        className={`absolute inline-flex h-full w-full animate-ping rounded-full ${config.bg} opacity-75`}
                      ></span>
                      <span
                        className={`relative inline-flex h-2 w-2 rounded-full ${config.bg}`}
                      ></span>
                    </span>
                  ) : (
                    config.icon
                  )}
                  {config.label}
                </span>
                <span className='text-[10px] text-slate-400'>•</span>
                <span className='text-[10px] font-medium text-slate-500 uppercase'>
                  {properties.stationStatus}
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
          <div className='mb-3 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3'>
            <div>
              <p className='text-[10px] whitespace-nowrap text-slate-500'>
                Mực nước hiện tại
              </p>
              <div className='flex items-baseline gap-1'>
                <span className='text-3xl font-bold tracking-tight text-slate-800'>
                  {properties.waterLevel?.toFixed(2) ?? '--'}
                </span>
                <span className='text-xs font-semibold text-slate-500'>
                  {properties.unit}
                </span>
              </div>
            </div>
            <div className='flex flex-col justify-center'>
              <p className='text-[10px] whitespace-nowrap text-slate-500'>
                Mã trạm
              </p>
              <p className='mt-0.5 text-sm leading-tight font-semibold break-words text-slate-700'>
                {properties.stationCode}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2 text-xs text-slate-500'>
            <Clock className='h-3.5 w-3.5' />
            <span>
              Cập nhật:{' '}
              <span className='font-medium text-slate-700'>
                {formattedDate}
              </span>
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
