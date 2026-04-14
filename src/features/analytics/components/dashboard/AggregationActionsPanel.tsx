'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { JobRun } from '@/features/analytics/types/analytics.dashboard.types';

type TriggerType = 'frequency' | 'severity' | 'hotspots';

function lastByType(runs: JobRun[], type: JobRun['jobType']) {
  return runs.find((r) => r.jobType === type) ?? null;
}

function statusVariant(status?: string | null) {
  if (status === 'SUCCESS') return 'success';
  if (status === 'FAILED') return 'destructive';
  if (status === 'RUNNING') return 'warning';
  return 'outline';
}

export function AggregationActionsPanel(props: {
  jobRuns: JobRun[];
  activeType?: TriggerType;
  onTabChange?: (type: TriggerType) => void;
  onRunNow: (type: TriggerType) => void;
  onViewHistory: () => void;
}) {
  const freq = lastByType(props.jobRuns, 'FREQUENCY');
  const sev = lastByType(props.jobRuns, 'SEVERITY');
  const hot = lastByType(props.jobRuns, 'HOTSPOTS');

  const blocks = {
    frequency: {
      title: 'Gom dữ liệu tần suất',
      note: 'Tổng hợp số sự kiện và lần vượt ngưỡng theo từng bước thời gian và khu vực.',
      schedule: 'Hằng ngày 02:00 (Giờ VN)',
      last: freq
    },
    severity: {
      title: 'Gom dữ liệu mức độ',
      note: 'Thống kê mực nước (max/TB/min), thời lượng và số lần đo theo từng bước.',
      schedule: 'Hằng ngày 02:10 (Giờ VN)',
      last: sev
    },
    hotspots: {
      title: 'Xếp hạng điểm nóng',
      note: 'Danh sách khu vực có điểm ngập cao trong kỳ để báo cáo.',
      schedule: 'Hằng tuần, thứ Hai 03:00 (Giờ VN)',
      last: hot
    }
  } as const;

  const jobStatusVi = (s?: string | null) => {
    if (!s) return 'CHƯA RÕ';
    if (s === 'SUCCESS') return 'Thành công';
    if (s === 'FAILED') return 'Thất bại';
    if (s === 'RUNNING') return 'Đang chạy';
    return s;
  };

  const renderBlock = (t: TriggerType) => {
    const b = blocks[t];
    const last = b.last;
    return (
      <div className='space-y-4'>
        <div className='space-y-1'>
          <div className='text-foreground text-sm font-medium'>{b.title}</div>
          <div className='text-muted-foreground text-xs leading-relaxed'>
            {b.note}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3 text-xs'>
          <div className='space-y-1'>
            <div className='text-muted-foreground'>Lần chạy gần nhất</div>
            <div>
              <Badge variant={statusVariant(last?.status) as any}>
                {jobStatusVi(last?.status)}
              </Badge>
            </div>
          </div>
          <div className='space-y-1'>
            <div className='text-muted-foreground'>Thời điểm</div>
            <div className='text-foreground'>
              {last
                ? new Date(last.finishedAt ?? last.startedAt).toLocaleString(
                    'vi-VN'
                  )
                : '—'}
            </div>
          </div>
          <div className='space-y-1'>
            <div className='text-muted-foreground'>Lịch tiếp theo</div>
            <div className='text-foreground'>{b.schedule}</div>
          </div>
          <div className='space-y-1'>
            <div className='text-muted-foreground'>Ghi đè an toàn</div>
            <div className='text-foreground'>
              Cập nhật/ghi đè, không đếm trùng
            </div>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Button type='button' onClick={() => props.onRunNow(t)}>
            Chạy ngay
          </Button>
          <Button type='button' variant='outline' onClick={props.onViewHistory}>
            Xem lịch sử
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className='border-border shadow-none'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm'>Thao tác gom dữ liệu</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={props.activeType ?? 'frequency'}
          onValueChange={(v) => props.onTabChange?.(v as TriggerType)}
        >
          <TabsList className='w-fit justify-start'>
            <TabsTrigger
              value='frequency'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Tần suất
            </TabsTrigger>
            <TabsTrigger
              value='severity'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Mức độ
            </TabsTrigger>
            <TabsTrigger
              value='hotspots'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Điểm nóng
            </TabsTrigger>
          </TabsList>
          <TabsContent value='frequency'>
            {renderBlock('frequency')}
          </TabsContent>
          <TabsContent value='severity'>{renderBlock('severity')}</TabsContent>
          <TabsContent value='hotspots'>{renderBlock('hotspots')}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
