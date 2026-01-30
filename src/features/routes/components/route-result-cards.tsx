'use client';

import React from 'react';
import { Card, Button } from '@/components/ui/common';
import { Navigation, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { RouteAnalysis } from '@/lib/types';
import { cn } from '@/lib/utils';

export type RouteResultCardsProps = {
  routes: RouteAnalysis[];
  selectedRouteIndex: number;
  onSelectRoute: (index: number) => void;
};

export function RouteResultCards({
  routes,
  selectedRouteIndex,
  onSelectRoute
}: RouteResultCardsProps) {
  return (
    <div className='pointer-events-none absolute bottom-4 left-1/2 z-10 flex max-w-full -translate-x-1/2 flex-col items-end justify-center gap-3 px-4 md:flex-row'>
      {routes.map((route) => {
        const isSafest = route.type === 'Safest';
        const isSelected = selectedRouteIndex === route.routeIndex;

        return (
          <div
            key={route.id}
            className='animate-in slide-in-from-bottom-8 pointer-events-auto w-full duration-500 md:w-64'
          >
            {/* Selected Indicator - Smaller */}
            {isSelected && (
              <div className='mb-1.5 flex justify-center'>
                <span
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-md',
                    isSafest
                      ? 'bg-emerald-500'
                      : route.riskLevel === 'Medium'
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                  )}
                >
                  <span className='relative flex h-1.5 w-1.5'>
                    <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75'></span>
                    <span className='relative inline-flex h-1.5 w-1.5 rounded-full bg-white'></span>
                  </span>
                  Đang hiển thị
                </span>
              </div>
            )}

            <Card
              onClick={() => onSelectRoute(route.routeIndex)}
              className={cn(
                'cursor-pointer overflow-hidden rounded-xl border-2 shadow-xl backdrop-blur-xl transition-all duration-300',
                isSelected
                  ? isSafest
                    ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20'
                    : route.riskLevel === 'Medium'
                      ? 'border-orange-500 bg-white ring-2 ring-orange-500/20'
                      : 'border-red-500 bg-white ring-2 ring-red-500/20'
                  : 'scale-95 border-transparent bg-white/90 opacity-80 hover:scale-100 hover:bg-white hover:opacity-100'
              )}
            >
              <div className='space-y-2 p-3'>
                {/* Header - Compact */}
                <div className='flex items-center justify-between'>
                  <div className='min-w-0 flex-1'>
                    <h3 className='truncate text-sm font-bold text-slate-900'>
                      {isSafest
                        ? 'Lộ trình An toàn nhất'
                        : route.type === 'Fastest'
                          ? 'Lộ trình Nhanh nhất'
                          : 'Lộ trình Thay thế'}
                    </h3>
                    <p className='truncate text-[10px] font-medium text-slate-500'>
                      {route.summary}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'ml-2 flex-shrink-0 rounded-lg p-1.5 shadow-sm',
                      isSafest
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-orange-100 text-orange-600'
                    )}
                  >
                    {isSafest ? (
                      <ShieldCheck className='h-4 w-4' />
                    ) : (
                      <Clock className='h-4 w-4' />
                    )}
                  </div>
                </div>

                {/* Stats Grid - Compact */}
                <div className='grid grid-cols-3 gap-1.5 border-t border-b border-slate-100 py-2'>
                  <div className='rounded-md bg-slate-50 p-1 text-center'>
                    <p className='text-[8px] font-bold text-slate-400 uppercase'>
                      Thời gian
                    </p>
                    <p className='text-xs font-black text-slate-800'>
                      {route.duration}
                    </p>
                  </div>
                  <div className='rounded-md bg-slate-50 p-1 text-center'>
                    <p className='text-[8px] font-bold text-slate-400 uppercase'>
                      Cự ly
                    </p>
                    <p className='text-xs font-black text-slate-800'>
                      {route.distance}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'rounded-md p-1 text-center',
                      route.riskLevel === 'Low' ? 'bg-emerald-50' : 'bg-red-50'
                    )}
                  >
                    <p className='text-[8px] font-bold text-slate-400 uppercase'>
                      Rủi ro
                    </p>
                    <p
                      className={cn(
                        'text-xs font-black',
                        route.riskLevel === 'Low'
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      )}
                    >
                      {route.riskLevel === 'Low'
                        ? 'THẤP'
                        : route.riskLevel === 'Medium'
                          ? 'VỪA'
                          : 'CAO'}
                    </p>
                  </div>
                </div>

                {/* AI Path Note - Only show for selected */}
                {isSelected && route.pathNote && (
                  <div className='rounded-lg border border-slate-100 bg-slate-50 p-2'>
                    <p className='line-clamp-2 text-[10px] leading-snug text-slate-600 italic'>
                      "{route.pathNote}"
                    </p>
                  </div>
                )}

                {/* Warnings - Compact, only show for selected */}
                {isSelected && route.warnings.length > 0 && (
                  <div className='flex items-start gap-1.5 rounded-lg border border-amber-100 bg-amber-50 p-2'>
                    <AlertTriangle className='mt-0.5 h-3 w-3 flex-shrink-0 text-amber-600' />
                    <div className='text-[10px] leading-snug font-medium text-amber-800'>
                      {route.warnings.slice(0, 2).map((w, i) => (
                        <p key={i} className='truncate'>
                          • {w}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button - Smaller */}
                <Button
                  className={cn(
                    'h-8 w-full rounded-lg text-xs font-bold shadow-md transition-all',
                    isSafest
                      ? 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700'
                      : 'bg-slate-800 text-white shadow-slate-500/20 hover:bg-slate-900'
                  )}
                >
                  <Navigation className='mr-1.5 h-3 w-3' />
                  {isSelected ? 'Bắt đầu' : 'Xem'}
                </Button>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
