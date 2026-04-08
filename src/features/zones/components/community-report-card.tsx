'use client';

import { Button } from '@/components/ui/common';
import type { CommunityFloodReport } from '../api/flood-reports-community.api';

type Props = {
  report: CommunityFloodReport;
  onClose: () => void;
};

export function CommunityReportCard({ report, onClose }: Props) {
  const created = report.createdAt
    ? new Date(report.createdAt).toLocaleString('vi-VN')
    : '—';

  return (
    <div className='pointer-events-auto w-full max-w-xs'>
      <div className='bg-card text-card-foreground overflow-hidden rounded-2xl border shadow-xl'>
        <div className='flex items-start justify-between gap-2 border-b px-4 py-3'>
          <div className='min-w-0'>
            <div className='flex items-center gap-2'>
              <span className='text-lg' aria-hidden>
                🚩
              </span>
              <h3 className='text-base font-bold'>Phản ánh cộng đồng</h3>
            </div>
            {report.address && (
              <p className='text-muted-foreground mt-1 text-xs'>
                {report.address}
              </p>
            )}
          </div>
          <Button
            size='icon'
            variant='ghost'
            className='h-7 w-7 shrink-0 rounded-full'
            onClick={onClose}
            aria-label='Đóng'
          >
            ×
          </Button>
        </div>
        <div className='space-y-2 px-4 py-3 text-sm'>
          {report.description && (
            <p className='text-foreground leading-snug'>{report.description}</p>
          )}
          <dl className='grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs'>
            {report.severity && (
              <>
                <dt className='text-muted-foreground'>Mức độ</dt>
                <dd className='font-medium'>{report.severity}</dd>
              </>
            )}
            {report.status && (
              <>
                <dt className='text-muted-foreground'>Trạng thái</dt>
                <dd>{report.status}</dd>
              </>
            )}
            {report.trustScore != null && (
              <>
                <dt className='text-muted-foreground'>Trust</dt>
                <dd className='tabular-nums'>{report.trustScore}</dd>
              </>
            )}
            <dt className='text-muted-foreground'>Gửi lúc</dt>
            <dd>{created}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
