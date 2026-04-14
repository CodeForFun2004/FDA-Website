'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import type { AnalyticsMetricType } from '@/features/analytics/types/analytics.dashboard.types';
import type {
  BucketType,
  AdministrativeArea
} from '@/features/analytics/types/analytics.types';

export type AnalyticsFiltersState = {
  metric: AnalyticsMetricType;
  bucketType: BucketType;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  areaId: string | 'all';
  topN: number;
};

const fieldCell =
  'flex min-w-0 flex-col gap-1.5 [&_button]:h-9 [&_input]:h-9 w-full';

/** Filter nào hiện theo metric (tránh gửi API thiếu field / thừa field). */
export function analyticsFilterVisibility(metric: AnalyticsMetricType) {
  const trend =
    metric === 'all' || metric === 'frequency' || metric === 'severity';
  const hotspots = metric === 'all' || metric === 'hotspots';
  return {
    bucket: trend,
    area: trend,
    topN: hotspots,
    dateRange: true
  };
}

export function AnalyticsFilters(props: {
  areas: AdministrativeArea[];
  areasLoading?: boolean;
  value: AnalyticsFiltersState;
  onChange: (next: AnalyticsFiltersState) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const v = props.value;
  const vis = analyticsFilterVisibility(v.metric);

  const set = (patch: Partial<AnalyticsFiltersState>) =>
    props.onChange({ ...v, ...patch });

  const onMetricChange = (x: string) => {
    const metric = x as AnalyticsMetricType;
    props.onChange({ ...v, metric });
  };

  return (
    <div className='bg-background/80 border-border sticky top-0 z-20 rounded-lg border p-3 backdrop-blur'>
      <div className='flex flex-col gap-3 md:flex-row md:items-end md:gap-3'>
        <div className='grid min-w-0 flex-1 grid-cols-1 items-end gap-2 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))]'>
          <div className={fieldCell}>
            <Label className='text-xs whitespace-nowrap'>Chỉ số</Label>
            <Select value={v.metric} onValueChange={onMetricChange}>
              <SelectTrigger className='h-9 w-full min-w-0'>
                <SelectValue placeholder='Chỉ số' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả</SelectItem>
                <SelectItem value='frequency'>Tần suất</SelectItem>
                <SelectItem value='severity'>Mức độ</SelectItem>
                <SelectItem value='hotspots'>Điểm nóng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {vis.bucket ? (
            <div className={fieldCell}>
              <Label className='text-xs whitespace-nowrap'>
                Bước thời gian
              </Label>
              <Select
                value={v.bucketType}
                onValueChange={(x) => set({ bucketType: x as BucketType })}
              >
                <SelectTrigger className='h-9 w-full min-w-0'>
                  <SelectValue placeholder='Bước' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='day'>Ngày</SelectItem>
                  <SelectItem value='week'>Tuần</SelectItem>
                  <SelectItem value='month'>Tháng</SelectItem>
                  <SelectItem value='year'>Năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {vis.dateRange ? (
            <>
              <div className={fieldCell}>
                <Label className='text-xs whitespace-nowrap'>Từ ngày</Label>
                <Input
                  className='h-9 w-full min-w-0'
                  type='date'
                  value={v.startDate}
                  onChange={(e) => set({ startDate: e.target.value })}
                />
              </div>

              <div className={fieldCell}>
                <Label className='text-xs whitespace-nowrap'>Đến ngày</Label>
                <Input
                  className='h-9 w-full min-w-0'
                  type='date'
                  value={v.endDate}
                  onChange={(e) => set({ endDate: e.target.value })}
                />
              </div>
            </>
          ) : null}

          {vis.area ? (
            <div className={fieldCell}>
              <Label className='text-xs whitespace-nowrap'>Khu vực</Label>
              <Select
                value={v.areaId}
                onValueChange={(x) => set({ areaId: x as string | 'all' })}
                disabled={props.areasLoading}
              >
                <SelectTrigger className='h-9 w-full min-w-0'>
                  <SelectValue
                    placeholder={
                      props.areasLoading ? 'Đang tải…' : 'Chọn khu vực'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Toàn bộ</SelectItem>
                  {props.areas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} ({a.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {vis.topN ? (
            <div className={fieldCell}>
              <Label className='text-xs whitespace-nowrap'>Top</Label>
              <Input
                className='h-9 w-full min-w-0 px-2 text-center'
                type='number'
                min={1}
                max={200}
                value={v.topN}
                onChange={(e) =>
                  set({
                    topN: Math.min(
                      200,
                      Math.max(1, Number(e.target.value) || 1)
                    )
                  })
                }
              />
            </div>
          ) : null}
        </div>

        <div className='flex shrink-0 justify-end gap-2 self-end md:ml-auto [&_button]:h-9'>
          <Button
            type='button'
            variant='outline'
            className='min-w-[7rem] px-4'
            onClick={props.onReset}
          >
            Đặt lại
          </Button>
          <Button
            type='button'
            className='min-w-[7rem] px-4'
            onClick={props.onApply}
          >
            Áp dụng
          </Button>
        </div>
      </div>
    </div>
  );
}
