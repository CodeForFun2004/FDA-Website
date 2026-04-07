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

export function AnalyticsFilters(props: {
  areas: AdministrativeArea[];
  value: AnalyticsFiltersState;
  onChange: (next: AnalyticsFiltersState) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const v = props.value;

  const set = (patch: Partial<AnalyticsFiltersState>) =>
    props.onChange({ ...v, ...patch });

  return (
    <div className='bg-background/80 border-border sticky top-0 z-20 rounded-lg border p-3 backdrop-blur'>
      <div className='grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-end'>
        <div className='space-y-1.5 lg:col-span-2'>
          <Label className='text-xs'>Metric</Label>
          <Select
            value={v.metric}
            onValueChange={(x) => set({ metric: x as any })}
          >
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

        <div className='space-y-1.5 lg:col-span-2'>
          <Label className='text-xs'>Bucket</Label>
          <Select
            value={v.bucketType}
            onValueChange={(x) => set({ bucketType: x as BucketType })}
            disabled={v.metric === 'hotspots'}
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

        <div className='space-y-1.5 lg:col-span-2'>
          <Label className='text-xs'>Start</Label>
          <Input
            className='h-9'
            type='date'
            value={v.startDate}
            onChange={(e) => set({ startDate: e.target.value })}
          />
        </div>

        <div className='space-y-1.5 lg:col-span-2'>
          <Label className='text-xs'>End</Label>
          <Input
            className='h-9'
            type='date'
            value={v.endDate}
            onChange={(e) => set({ endDate: e.target.value })}
          />
        </div>

        <div className='space-y-1.5 lg:col-span-2'>
          <Label className='text-xs'>Area</Label>
          <Select
            value={v.areaId}
            onValueChange={(x) => set({ areaId: x as any })}
          >
            <SelectTrigger className='h-9 w-full'>
              <SelectValue placeholder='All areas' />
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

        <div className='space-y-1.5 lg:col-span-2'>
          <Label className='text-xs'>Hotspot level</Label>
          <Select
            value={v.areaLevel}
            onValueChange={(x) => set({ areaLevel: x as any })}
            disabled={v.metric !== 'hotspots'}
          >
            <SelectTrigger className='h-9 w-full'>
              <SelectValue placeholder='Level' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All</SelectItem>
              <SelectItem value='district'>District</SelectItem>
              <SelectItem value='ward'>Ward</SelectItem>
              <SelectItem value='province'>Province</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-1.5 lg:col-span-2'>
          <Label className='text-xs'>Top N</Label>
          <Input
            className='h-9'
            type='number'
            min={1}
            max={50}
            value={v.topN}
            onChange={(e) => set({ topN: Number(e.target.value) || 1 })}
            disabled={v.metric !== 'hotspots'}
          />
        </div>

        <div className='flex gap-2 lg:col-span-4 lg:justify-end'>
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
