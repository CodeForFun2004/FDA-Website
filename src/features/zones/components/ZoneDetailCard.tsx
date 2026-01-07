'use client';

import React from 'react';
import { Card, Button } from '@/components/ui/common';
import {
  AlertTriangle,
  Navigation,
  ArrowUpRight,
  Droplets
} from 'lucide-react';
import { Zone } from '@/lib/types';
import { WaterLevelTrendChart } from './WaterLevelTrendChart';

export type ZoneDetailCardProps = {
  zone: Zone;
  onClose: () => void;
};

export function ZoneDetailCard({ zone, onClose }: ZoneDetailCardProps) {
  return (
    <div className='animate-in slide-in-from-right-4 pointer-events-none absolute top-4 right-4 z-10 w-full max-w-xs duration-300'>
      <Card className='pointer-events-auto overflow-hidden rounded-2xl border-none bg-white/95 shadow-xl backdrop-blur-md'>
        {/* Header: Zone Name & Status */}
        <div className='p-4 pb-2'>
          <div className='flex items-start justify-between'>
            <div className='min-w-0 flex-1'>
              <h2 className='truncate text-lg font-bold text-slate-800'>
                {zone.name}
              </h2>
              <div className='mt-1 flex items-center gap-2'>
                {zone.riskLevel === 'Flooded' ? (
                  <span className='flex items-center text-[10px] font-bold text-red-600'>
                    <span className='relative mr-1 flex h-2 w-2'>
                      <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75'></span>
                      <span className='relative inline-flex h-2 w-2 rounded-full bg-red-500'></span>
                    </span>
                    Nguy cơ ngập sâu
                  </span>
                ) : zone.riskLevel === 'Watch' ? (
                  <span className='flex items-center text-[10px] font-bold text-orange-600'>
                    <AlertTriangle className='mr-1 h-3 w-3' /> Cảnh báo mực nước
                  </span>
                ) : (
                  <span className='flex items-center text-[10px] font-bold text-emerald-600'>
                    <Droplets className='mr-1 h-3 w-3' /> An toàn
                  </span>
                )}
              </div>
            </div>
            <Button
              size='icon'
              variant='ghost'
              className='h-7 w-7 flex-shrink-0 rounded-full bg-slate-100 text-sm'
              onClick={onClose}
            >
              ×
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className='px-4 pb-4'>
          {/* Trend Header */}
          <div className='mb-3 flex items-center justify-between'>
            <div>
              <p className='text-xs font-medium text-slate-600'>
                Xu hướng mực nước
              </p>
              <p className='text-[10px] text-slate-400'>
                Dự kiến: <span className='font-bold text-slate-800'>0.5m</span>
              </p>
            </div>
            <span className='flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500'>
              <ArrowUpRight className='mr-0.5 h-3 w-3' /> Tăng
            </span>
          </div>

          {/* Chart */}
          <WaterLevelTrendChart />

          {/* Action Buttons */}
          <div className='mt-3 grid grid-cols-2 gap-2'>
            <Button className='h-8 w-full rounded-lg bg-blue-600 text-[10px] font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700'>
              <Navigation className='mr-1 h-3 w-3' /> Tránh ngập
            </Button>
            <Button
              variant='outline'
              className='h-8 w-full rounded-lg border-slate-200 text-[10px] text-slate-600'
            >
              Chi tiết
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
