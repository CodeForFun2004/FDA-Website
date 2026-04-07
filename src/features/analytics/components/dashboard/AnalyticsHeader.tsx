'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { RefreshCcw, Activity, ChevronDown } from 'lucide-react';

type TriggerType = 'frequency' | 'severity' | 'hotspots';

type ActiveTab =
  | 'overview'
  | 'jobs'
  | 'results'
  | 'operations'
  | 'admin-areas'
  | 'flood-events'
  | 'notes';

// Per-tab heading config
const TAB_META: Record<ActiveTab, { title: string; description: string }> = {
  overview: {
    title: 'Analytics Overview',
    description:
      'Tổng quan hoạt động aggregation — jobs đang chạy, freshness và các KPI chính.'
  },
  jobs: {
    title: 'Job Monitor',
    description:
      'Theo dõi real-time các job aggregation đang chạy và lịch sử kết quả.'
  },
  results: {
    title: 'Analytics Results',
    description:
      'Xem kết quả tần suất, mức độ và hotspot ranking theo bucket/area đã chọn.'
  },
  operations: {
    title: 'Aggregation Operations',
    description:
      'Khởi chạy thủ công các job aggregation (frequency, severity, hotspot) cho period/area tuỳ chọn.'
  },
  'admin-areas': {
    title: 'Administrative Areas',
    description:
      'Quản lý danh sách vùng hành chính — dimension chính dùng để nhóm dữ liệu trong aggregation.'
  },
  'flood-events': {
    title: 'Flood Events',
    description:
      'Quản lý sự kiện lũ — dữ liệu nguồn được đếm trong Frequency aggregation (eventCount).'
  },
  notes: {
    title: 'System Notes',
    description:
      'Ghi chú kỹ thuật về cơ chế hoạt động, idempotency và lưu ý khi vận hành aggregation.'
  }
};

// Tabs that don't need analytics action buttons
const DATA_MANAGEMENT_TABS: ActiveTab[] = [
  'admin-areas',
  'flood-events',
  'notes'
];

export function AnalyticsHeader(props: {
  activeTab: ActiveTab;
  onRefresh: () => void;
  onOpenJobMonitor: () => void;
  onTrigger: (type: TriggerType) => void;
  isRefreshing?: boolean;
}) {
  const { activeTab } = props;
  const meta = TAB_META[activeTab] ?? TAB_META.overview;
  const isDataTab = DATA_MANAGEMENT_TABS.includes(activeTab);

  return (
    <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
      <div className='space-y-1'>
        <h2 className='text-3xl font-bold tracking-tight'>{meta.title}</h2>
        <p className='text-muted-foreground max-w-xl text-sm'>
          {meta.description}
        </p>
      </div>

      {!isDataTab && (
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={props.onRefresh}
            disabled={props.isRefreshing}
          >
            <RefreshCcw className='mr-2 h-4 w-4' />
            Refresh
          </Button>

          <Button
            type='button'
            variant='outline'
            onClick={props.onOpenJobMonitor}
          >
            <Activity className='mr-2 h-4 w-4' />
            Job monitor
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type='button'>
                Trigger
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel>Manual re-aggregation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => props.onTrigger('frequency')}>
                Frequency aggregation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => props.onTrigger('severity')}>
                Severity aggregation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => props.onTrigger('hotspots')}>
                Hotspot ranking
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
