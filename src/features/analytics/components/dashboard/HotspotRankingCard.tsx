'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import type { HotspotItem } from '@/features/analytics/types/analytics.dashboard.types';

function fmt(n: number) {
  return Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(n);
}

export function HotspotRankingCard(props: {
  items: HotspotItem[];
  /** topN đã gửi lên API (giới hạn tổng bản ghi) */
  apiTopN: number;
  pageSize?: number;
  noOuterCard?: boolean;
}) {
  const pageSize = props.pageSize ?? 6;
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPage(1);
  }, [props.items]);

  const maxScore = props.items.reduce((m, r) => Math.max(m, r.score), 0) || 1;

  const total = props.items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const rows = props.items.slice(start, start + pageSize);

  const list = (
    <div className='space-y-2'>
      {rows.length === 0 ? (
        <div className='text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm'>
          Chưa có dữ liệu — thử đổi khoảng thời gian hoặc tăng số bản ghi lấy
          về.
        </div>
      ) : (
        rows.map((r) => {
          const pct = Math.round((r.score / maxScore) * 100);
          return (
            <div
              key={`${r.areaId}-${r.rank}`}
              className='rounded-md border p-3'
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='secondary'>#{r.rank}</Badge>
                    <div className='truncate text-sm font-medium'>
                      {r.areaName}
                    </div>
                  </div>
                  <div className='text-muted-foreground mt-1 text-[11px]'>
                    {new Date(r.calculatedAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-foreground text-sm font-semibold'>
                    {fmt(r.score)}
                  </div>
                  <div className='text-muted-foreground text-[11px]'>điểm</div>
                </div>
              </div>

              <Progress value={pct} className='mt-3 h-1.5' />

              <div className='mt-3 grid grid-cols-3 gap-2 text-[11px]'>
                <div className='bg-muted/40 rounded-md p-2'>
                  <div className='text-muted-foreground'>Tần suất</div>
                  <div className='font-medium'>{fmt(r.frequencyScore)}</div>
                </div>
                <div className='bg-muted/40 rounded-md p-2'>
                  <div className='text-muted-foreground'>Mức độ</div>
                  <div className='font-medium'>{fmt(r.severityScore)}</div>
                </div>
                <div className='bg-muted/40 rounded-md p-2'>
                  <div className='text-muted-foreground'>Thời lượng</div>
                  <div className='font-medium'>{fmt(r.durationScore)}</div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const pager =
    total > 0 && totalPages > 1 ? (
      <div className='text-muted-foreground flex flex-col items-center gap-2 pt-2 sm:flex-row sm:justify-between'>
        <span className='text-[11px]'>
          {start + 1}–{Math.min(start + pageSize, total)} / {total} (tối đa{' '}
          {props.apiTopN})
        </span>
        <Pagination
          page={safePage}
          total={totalPages}
          onChange={setPage}
          className='justify-end'
        />
      </div>
    ) : total > 0 ? (
      <p className='text-muted-foreground pt-1 text-[11px]'>
        {total} bản ghi (tối đa {props.apiTopN})
      </p>
    ) : null;

  if (props.noOuterCard) {
    return (
      <div className='space-y-3'>
        <h3 className='text-foreground text-sm font-semibold'>
          Xếp hạng điểm nóng
        </h3>
        {list}
        {pager}
      </div>
    );
  }

  return (
    <Card className='border-border shadow-none'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm'>Xếp hạng điểm nóng</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='text-muted-foreground text-xs leading-relaxed'>
          Danh sách khu vực có điểm ngập cao trong kỳ đã chọn.
        </div>
        {list}
        {pager}
      </CardContent>
    </Card>
  );
}
