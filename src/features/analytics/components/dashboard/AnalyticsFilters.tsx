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
import type {
  AnalyticsMetricType,
  AreaLevel
} from '@/features/analytics/types/analytics.dashboard.types';
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
  areaLevel: AreaLevel;
  topN: number;
};

const fieldWrap =
  'flex min-w-0 shrink-0 flex-col gap-1.5 [&_button]:h-9 [&_input]:h-9';

/** Filter nào hiện theo metric (tránh gửi API thiếu field / thừa field). */
export function analyticsFilterVisibility(metric: AnalyticsMetricType) {
  const trend =
    metric === 'all' || metric === 'frequency' || metric === 'severity';
  const hotspots = metric === 'all' || metric === 'hotspots';
  return {
    bucket: trend,
    area: trend,
    hotspotLevel: hotspots,
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
    const patch: Partial<AnalyticsFiltersState> = { metric };
    if (metric === 'hotspots' && v.areaLevel === 'all') {
      patch.areaLevel = 'ward';
    }
    props.onChange({ ...v, ...patch });
  };

  const hotspotLevelValue =
    v.metric === 'hotspots' && v.areaLevel === 'all' ? 'ward' : v.areaLevel;

  return (
    <div className='bg-background/80 border-border sticky top-0 z-20 rounded-lg border p-3 backdrop-blur'>
      <div className='flex flex-nowrap items-end gap-2 overflow-x-auto pb-0.5'>
        <div className={`${fieldWrap} w-[6.75rem]`}>
          <Label className='text-xs whitespace-nowrap'>Metric</Label>
          <Select value={v.metric} onValueChange={onMetricChange}>
            <SelectTrigger className='h-9 w-full'>
              <SelectValue placeholder='Metric' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All</SelectItem>
              <SelectItem value='frequency'>Frequency</SelectItem>
              <SelectItem value='severity'>Severity</SelectItem>
              <SelectItem value='hotspots'>Hotspots</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {vis.bucket ? (
          <div className={`${fieldWrap} w-[6.25rem]`}>
            <Label className='text-xs whitespace-nowrap'>Bucket</Label>
            <Select
              value={v.bucketType}
              onValueChange={(x) => set({ bucketType: x as BucketType })}
            >
              <SelectTrigger className='h-9 w-full'>
                <SelectValue placeholder='Bucket' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='day'>Day</SelectItem>
                <SelectItem value='week'>Week</SelectItem>
                <SelectItem value='month'>Month</SelectItem>
                <SelectItem value='year'>Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {vis.dateRange ? (
          <>
            <div className={`${fieldWrap} w-[9.25rem]`}>
              <Label className='text-xs whitespace-nowrap'>Start</Label>
              <Input
                className='h-9'
                type='date'
                value={v.startDate}
                onChange={(e) => set({ startDate: e.target.value })}
              />
            </div>

            <div className={`${fieldWrap} w-[9.25rem]`}>
              <Label className='text-xs whitespace-nowrap'>End</Label>
              <Input
                className='h-9'
                type='date'
                value={v.endDate}
                onChange={(e) => set({ endDate: e.target.value })}
              />
            </div>
          </>
        ) : null}

        {vis.area ? (
          <div className={`${fieldWrap} w-[10.5rem] max-w-[11rem]`}>
            <Label className='text-xs whitespace-nowrap'>Area</Label>
            <Select
              value={v.areaId}
              onValueChange={(x) => set({ areaId: x as string | 'all' })}
              disabled={props.areasLoading}
            >
              <SelectTrigger className='h-9 w-full min-w-0'>
                <SelectValue
                  placeholder={
                    props.areasLoading ? 'Đang tải areas…' : 'Chọn area'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All areas</SelectItem>
                {props.areas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {vis.hotspotLevel ? (
          <div className={`${fieldWrap} w-[7.5rem]`}>
            <Label className='text-xs whitespace-nowrap'>Hotspot level</Label>
            <Select
              value={hotspotLevelValue}
              onValueChange={(x) => set({ areaLevel: x as AreaLevel })}
            >
              <SelectTrigger className='h-9 w-full'>
                <SelectValue placeholder='Level' />
              </SelectTrigger>
              <SelectContent>
                {v.metric === 'all' ? (
                  <SelectItem value='all'>All (→ ward API)</SelectItem>
                ) : null}
                <SelectItem value='ward'>Ward</SelectItem>
                <SelectItem value='street'>Street</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {vis.topN ? (
          <div className={`${fieldWrap} w-[4.25rem]`}>
            <Label className='text-xs whitespace-nowrap'>Top N</Label>
            <Input
              className='h-9 w-full min-w-0 px-2 text-center'
              type='number'
              min={1}
              max={200}
              value={v.topN}
              onChange={(e) =>
                set({
                  topN: Math.min(200, Math.max(1, Number(e.target.value) || 1))
                })
              }
            />
          </div>
        ) : null}

        <div className='flex shrink-0 gap-2 pb-0.5'>
          <Button type='button' variant='outline' onClick={props.onReset}>
            Reset
          </Button>
          <Button type='button' onClick={props.onApply}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
