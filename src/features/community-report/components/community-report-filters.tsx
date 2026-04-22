'use client';

import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/common';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, RefreshCw, SlidersHorizontal } from 'lucide-react';
import type { ModeratorCommunityFilters } from '../types/community-report.type';

type Props = {
  filters: ModeratorCommunityFilters;
  filtersOpen: boolean;
  appliedFiltersCount: number;
  isFetching: boolean;
  onToggleFilters: () => void;
  onReload: () => void;
  onReset: () => void;
  onUpdateFilter: <K extends keyof ModeratorCommunityFilters>(
    key: K,
    value: ModeratorCommunityFilters[K]
  ) => void;
};

export function CommunityReportFilters({
  filters,
  filtersOpen,
  appliedFiltersCount,
  isFetching,
  onToggleFilters,
  onReload,
  onReset,
  onUpdateFilter
}: Props) {
  return (
    <>
      <Card>
        <CardContent className='flex flex-wrap items-center justify-between gap-3 p-4'>
          <div>
            <div className='text-sm font-semibold text-slate-900'>
              Lọc nhanh theo trạng thái
            </div>
            <div className='text-muted-foreground text-sm'>
              Chuyển nhanh giữa bài đang hiển thị và bài đã ẩn.
            </div>
          </div>
          <Tabs
            value={filters.status || 'tat-ca'}
            onValueChange={(value) =>
              onUpdateFilter(
                'status',
                value === 'tat-ca'
                  ? ''
                  : (value as ModeratorCommunityFilters['status'])
              )
            }
          >
            <TabsList className='bg-muted/50 grid h-auto grid-cols-3 gap-1 rounded-lg p-1'>
              <TabsTrigger
                value='tat-ca'
                className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-9 rounded-md px-2 text-xs font-semibold data-[state=active]:shadow-none'
              >
                Tất cả
              </TabsTrigger>
              <TabsTrigger
                value='published'
                className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-9 rounded-md px-2 text-xs font-semibold data-[state=active]:shadow-none'
              >
                Đang hiển thị
              </TabsTrigger>
              <TabsTrigger
                value='hidden'
                className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-9 rounded-md px-2 text-xs font-semibold data-[state=active]:shadow-none'
              >
                Đã ẩn
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-4'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <div className='text-sm font-semibold text-slate-900'>Bộ lọc</div>
              <div className='text-muted-foreground text-sm'>
                Mức độ, điểm tin cậy và khoảng ngày gửi.
              </div>
            </div>
            <Button
              type='button'
              variant={filtersOpen ? 'default' : 'outline'}
              size='sm'
              onClick={onToggleFilters}
              className='h-9 gap-2 whitespace-nowrap'
              aria-expanded={filtersOpen}
              aria-controls='community-filters'
            >
              <SlidersHorizontal className='h-4 w-4' />
              Bộ lọc
              {appliedFiltersCount > 0 && (
                <span className='bg-background/20 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold'>
                  {appliedFiltersCount}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </div>

          {filtersOpen && (
            <div
              id='community-filters'
              className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'
            >
              <div className='space-y-1.5'>
                <div className='text-sm font-medium'>Mức độ</div>
                <Select
                  value={filters.severity || 'tat-ca'}
                  onValueChange={(value) =>
                    onUpdateFilter(
                      'severity',
                      value === 'tat-ca'
                        ? ''
                        : (value as ModeratorCommunityFilters['severity'])
                    )
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Chọn mức độ' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='tat-ca'>Tất cả</SelectItem>
                    <SelectItem value='low'>Thấp</SelectItem>
                    <SelectItem value='medium'>Trung bình</SelectItem>
                    <SelectItem value='high'>Cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <div className='text-sm font-medium'>
                  Điểm tin cậy tối thiểu
                </div>
                <Input
                  type='number'
                  min='0'
                  step='1'
                  placeholder='Ví dụ: 1'
                  value={filters.minTrustScore}
                  onChange={(event) =>
                    onUpdateFilter('minTrustScore', event.target.value)
                  }
                />
              </div>

              <div className='space-y-1.5'>
                <div className='text-sm font-medium'>Từ ngày</div>
                <Input
                  type='date'
                  value={filters.from}
                  onChange={(event) =>
                    onUpdateFilter('from', event.target.value)
                  }
                />
              </div>

              <div className='space-y-1.5'>
                <div className='text-sm font-medium'>Đến ngày</div>
                <Input
                  type='date'
                  value={filters.to}
                  onChange={(event) => onUpdateFilter('to', event.target.value)}
                />
              </div>

              <div className='flex flex-wrap gap-2 pt-1 md:col-span-2 xl:col-span-4'>
                <Button
                  type='button'
                  variant='default'
                  onClick={onReload}
                  disabled={isFetching}
                  className='gap-2'
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
                  />
                  Tải lại
                </Button>
                <Button type='button' variant='default' onClick={onReset}>
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
