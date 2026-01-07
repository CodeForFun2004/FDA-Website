'use client';

import React, { useState } from 'react';
import { Card, Button, Input } from '@/components/ui/common';
import {
  Navigation,
  X,
  Locate,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type FloatingInputPanelProps = {
  origin: string;
  destination: string;
  isSearching: boolean;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onUseMyLocation: () => void;
};

export function FloatingInputPanel({
  origin,
  destination,
  isSearching,
  onOriginChange,
  onDestinationChange,
  onSearch,
  onReset,
  onUseMyLocation
}: FloatingInputPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className='animate-in slide-in-from-left-4 absolute top-4 left-4 z-20 w-full max-w-xs duration-500'>
      {/* Collapsed State - Compact Toggle Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className='group flex items-center gap-2 rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md transition-all hover:bg-white'
        >
          <div className='rounded-lg bg-blue-100 p-2 transition-colors group-hover:bg-blue-200'>
            <Search className='h-4 w-4 text-blue-600' />
          </div>
          <div className='text-left'>
            <p className='text-sm font-bold text-slate-800'>Tìm lộ trình</p>
            <p className='max-w-[150px] truncate text-xs text-slate-500'>
              {destination || 'Nhấn để tìm kiếm'}
            </p>
          </div>
          <ChevronDown className='ml-2 h-4 w-4 text-slate-400' />
        </button>
      )}

      {/* Expanded State - Full Panel */}
      {isExpanded && (
        <Card className='space-y-3 rounded-2xl border-none bg-white/95 p-4 shadow-xl backdrop-blur-md'>
          <div className='flex items-center justify-between border-b border-slate-100 pb-2'>
            <h2 className='flex items-center gap-2 text-base font-bold text-slate-800'>
              <Navigation className='h-4 w-4 text-blue-600' />
              Tìm lộ trình an toàn
            </h2>
            <div className='flex items-center gap-2'>
              {isSearching && (
                <span className='animate-pulse text-[10px] font-medium text-blue-600'>
                  Đang phân tích...
                </span>
              )}
              <button
                onClick={() => setIsExpanded(false)}
                className='rounded-lg p-1 transition-colors hover:bg-slate-100'
                title='Thu gọn'
              >
                <ChevronUp className='h-4 w-4 text-slate-400' />
              </button>
            </div>
          </div>

          <div className='relative space-y-3'>
            {/* Decorative Connector Line */}
            <div className='absolute top-[32px] bottom-[32px] left-[13px] z-0 w-0.5 border-l-2 border-dotted border-slate-300'></div>

            <div className='relative z-10'>
              <label className='mb-1 ml-1 block text-[10px] font-bold tracking-wide text-slate-500 uppercase'>
                Điểm xuất phát
              </label>
              <div className='flex items-center gap-2'>
                <div className='h-3 w-3 flex-shrink-0 rounded-full bg-blue-600 shadow-sm ring-2 ring-blue-100'></div>
                <div className='relative flex-1'>
                  <Input
                    className='h-9 rounded-lg border-slate-200 bg-slate-50 pr-7 pl-2 text-sm font-medium transition-all focus:bg-white focus:ring-2 focus:ring-blue-100'
                    placeholder='Nhập địa điểm...'
                    value={origin}
                    onChange={(e) => onOriginChange(e.target.value)}
                  />
                  <button
                    onClick={onUseMyLocation}
                    className='absolute top-2 right-1.5 text-blue-500 hover:text-blue-700'
                    title='Dùng vị trí hiện tại'
                  >
                    <Locate className='h-4 w-4' />
                  </button>
                </div>
              </div>
            </div>

            <div className='relative z-10'>
              <label className='mb-1 ml-1 block text-[10px] font-bold tracking-wide text-slate-500 uppercase'>
                Điểm đến
              </label>
              <div className='flex items-center gap-2'>
                <div className='h-3 w-3 flex-shrink-0 rounded-full bg-red-500 shadow-sm ring-2 ring-red-100'></div>
                <div className='relative flex-1'>
                  <Input
                    className='h-9 rounded-lg border-slate-200 bg-slate-50 pr-7 pl-2 text-sm font-medium transition-all focus:bg-white focus:ring-2 focus:ring-red-100'
                    placeholder='Bạn muốn đến đâu?'
                    value={destination}
                    onChange={(e) => onDestinationChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                  />
                  {destination && (
                    <button
                      onClick={onReset}
                      className='absolute top-2.5 right-2 text-slate-400 hover:text-slate-600'
                    >
                      <X className='h-3.5 w-3.5' />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={onSearch}
            disabled={isSearching || !destination}
            className='h-10 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-transform hover:from-blue-700 hover:to-indigo-700 active:scale-95'
          >
            {isSearching ? 'Đang tìm kiếm...' : 'Tìm lộ trình'}
          </Button>
        </Card>
      )}
    </div>
  );
}
