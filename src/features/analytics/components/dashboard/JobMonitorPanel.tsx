'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  JobRun,
  JobStatus
} from '@/features/analytics/types/analytics.dashboard.types';
import { Copy, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

function statusVariant(status: JobStatus) {
  if (status === 'SUCCESS') return 'success';
  if (status === 'FAILED') return 'destructive';
  if (status === 'RUNNING') return 'warning';
  return 'outline';
}

function fmtMs(ms?: number | null) {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  return `${m}m`;
}

function fmtNum(n?: number | null) {
  if (n === null || n === undefined) return '—';
  return Intl.NumberFormat('vi-VN').format(n);
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Đã sao chép');
  } catch {
    toast.error('Sao chép thất bại');
  }
}

function jobStatusLabel(s: JobStatus) {
  if (s === 'SUCCESS') return 'Thành công';
  if (s === 'FAILED') return 'Thất bại';
  if (s === 'RUNNING') return 'Đang chạy';
  return s;
}

function elapsedPercent(run: JobRun) {
  if (run.status !== 'RUNNING') return 0;
  const start = new Date(run.startedAt).getTime();
  const elapsed = Date.now() - start;
  // soft progress: show 20%..95% based on elapsed up to 5 minutes
  const p = Math.min(95, 20 + (elapsed / (5 * 60 * 1000)) * 75);
  return Math.max(10, Math.round(p));
}

export function JobMonitorPanel(props: {
  jobRuns: JobRun[];
  onRetry: (jobRunId: string) => void;
  onViewDetails: (jobRunId: string) => void;
  onTrackJobRunId?: (jobRunId: string) => void;
}) {
  const running = props.jobRuns.filter((r) => r.status === 'RUNNING');
  const failed = props.jobRuns.filter((r) => r.status === 'FAILED');
  const recent = props.jobRuns.slice(0, 12);
  const [trackValue, setTrackValue] = React.useState('');

  const Table = ({ rows }: { rows: JobRun[] }) => (
    <div className='overflow-hidden rounded-lg border'>
      <div className='bg-muted grid grid-cols-12 gap-2 px-3 py-2 text-[11px] font-medium'>
        <div className='col-span-3'>Tác vụ</div>
        <div className='col-span-2'>Trạng thái</div>
        <div className='col-span-3'>Bắt đầu</div>
        <div className='col-span-2'>Thời gian chạy</div>
        <div className='col-span-2 text-right'>Thao tác</div>
      </div>
      <div className='divide-border divide-y'>
        {rows.length === 0 ? (
          <div className='text-muted-foreground px-3 py-8 text-center text-sm'>
            Chưa có lần chạy.
          </div>
        ) : (
          rows.map((r) => (
            <div
              key={r.jobRunId}
              className='grid grid-cols-12 gap-2 px-3 py-2 text-xs'
            >
              <div className='col-span-3 truncate font-mono'>{r.jobRunId}</div>
              <div className='col-span-2'>
                <Badge variant={statusVariant(r.status) as any}>
                  {jobStatusLabel(r.status)}
                </Badge>
              </div>
              <div className='text-muted-foreground col-span-3 truncate'>
                {new Date(r.startedAt).toLocaleString('vi-VN')}
              </div>
              <div className='text-muted-foreground col-span-2'>
                {fmtMs(r.executionTimeMs)}
              </div>
              <div className='col-span-2 flex justify-end gap-1'>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => void copy(r.jobRunId)}
                  aria-label='Sao chép'
                >
                  <Copy className='h-4 w-4' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-8 text-[10px]'
                  onClick={() => props.onViewDetails(r.jobRunId)}
                >
                  Xem
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => props.onRetry(r.jobRunId)}
                  aria-label='Thử lại'
                >
                  <RotateCcw className='h-4 w-4' />
                </Button>
              </div>

              {r.status === 'FAILED' && r.errorMessage ? (
                <div className='text-destructive col-span-12 mt-1 text-[11px] leading-relaxed'>
                  {r.errorMessage}
                </div>
              ) : null}
              {r.status === 'RUNNING' ? (
                <div className='col-span-12 mt-1'>
                  <div className='text-muted-foreground flex items-center justify-between text-[11px]'>
                    <span>
                      Đang xử lý… {fmtNum(r.recordsProcessed)} bản ghi
                    </span>
                    <span>{elapsedPercent(r)}%</span>
                  </div>
                  <Progress value={elapsedPercent(r)} className='mt-1 h-1.5' />
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <Card className='border-border shadow-none' id='job-monitor'>
      <CardHeader className='pb-3'>
        <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
          <CardTitle className='text-sm'>Giám sát tác vụ</CardTitle>
          {props.onTrackJobRunId ? (
            <div className='flex items-center gap-2'>
              <Input
                className='h-9 w-[240px]'
                placeholder='Dán mã jobRunId…'
                value={trackValue}
                onChange={(e) => setTrackValue(e.target.value)}
              />
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  const id = trackValue.trim();
                  if (!id) return;
                  props.onTrackJobRunId?.(id);
                  setTrackValue('');
                }}
              >
                Theo dõi
              </Button>
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='running'>
          <TabsList className='w-fit justify-start'>
            <TabsTrigger
              value='running'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Đang chạy ({running.length})
            </TabsTrigger>
            <TabsTrigger
              value='recent'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Gần đây
            </TabsTrigger>
            <TabsTrigger
              value='failed'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Lỗi ({failed.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value='running'>
            <Table rows={running} />
          </TabsContent>
          <TabsContent value='recent'>
            <Table rows={recent} />
          </TabsContent>
          <TabsContent value='failed'>
            <Table rows={failed} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
