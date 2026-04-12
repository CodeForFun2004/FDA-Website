'use client';

import * as React from 'react';
import { Pagination, type PaginationProps } from '@/components/ui/pagination';
import type {
  FrequencyAnalyticsPoint,
  SeverityAnalyticsPoint
} from '@/features/analytics/types/analytics.dashboard.types';

type PagProps = Pick<PaginationProps, 'page' | 'total' | 'onChange'>;

function fmtDate(v: string) {
  try {
    return new Date(v).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return v;
  }
}

export function AnalyticsTrendPointsTable(props: {
  mode: 'frequency' | 'severity';
  points: FrequencyAnalyticsPoint[] | SeverityAnalyticsPoint[];
  pageSize?: number;
}) {
  const pageSize = props.pageSize ?? 8;
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPage(1);
  }, [props.points]);

  const total = props.points.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = props.points.slice(start, start + pageSize);

  if (total === 0) {
    return (
      <div className='text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm'>
        Chưa có điểm dữ liệu trend (chọn Area + Apply, hoặc chờ job
        aggregation).
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <h4 className='text-foreground text-xs font-semibold tracking-wide uppercase'>
        Chi tiết theo bucket
      </h4>
      <div className='overflow-x-auto rounded-md border'>
        <table className='w-full text-left text-xs'>
          <thead className='bg-muted/50 border-b'>
            {props.mode === 'frequency' ? (
              <tr>
                <th className='px-3 py-2 font-medium'>Thời điểm</th>
                <th className='px-3 py-2 font-medium'>Events</th>
                <th className='px-3 py-2 font-medium'>Exceed</th>
              </tr>
            ) : (
              <tr>
                <th className='px-3 py-2 font-medium'>Thời điểm</th>
                <th className='px-3 py-2 font-medium'>Max</th>
                <th className='px-3 py-2 font-medium'>Avg</th>
                <th className='px-3 py-2 font-medium'>Min</th>
                <th className='px-3 py-2 font-medium'>Readings</th>
              </tr>
            )}
          </thead>
          <tbody>
            {props.mode === 'frequency'
              ? (slice as FrequencyAnalyticsPoint[]).map((p, i) => (
                  <tr
                    key={`${p.timeBucket}-${i}`}
                    className='border-border border-b last:border-0'
                  >
                    <td className='text-muted-foreground px-3 py-2 whitespace-nowrap'>
                      {fmtDate(p.timeBucket)}
                    </td>
                    <td className='px-3 py-2 font-medium'>{p.eventCount}</td>
                    <td className='px-3 py-2'>{p.exceedCount}</td>
                  </tr>
                ))
              : (slice as SeverityAnalyticsPoint[]).map((p, i) => (
                  <tr
                    key={`${p.timeBucket}-${i}`}
                    className='border-border border-b last:border-0'
                  >
                    <td className='text-muted-foreground px-3 py-2 whitespace-nowrap'>
                      {fmtDate(p.timeBucket)}
                    </td>
                    <td className='px-3 py-2'>{p.maxLevel.toFixed(2)}</td>
                    <td className='px-3 py-2'>{p.avgLevel.toFixed(2)}</td>
                    <td className='px-3 py-2'>{p.minLevel.toFixed(2)}</td>
                    <td className='px-3 py-2'>{p.readingCount}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div className='text-muted-foreground flex flex-col items-center gap-2 sm:flex-row sm:justify-between'>
        <span className='text-[11px]'>
          {start + 1}–{Math.min(start + pageSize, total)} / {total} bucket
        </span>
        <Pagination
          page={safePage}
          total={totalPages}
          onChange={setPage}
          className='justify-end'
        />
      </div>
    </div>
  );
}
