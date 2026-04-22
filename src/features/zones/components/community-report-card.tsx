'use client';

import { Button } from '@/components/ui/common';
import type { CommunityFloodReport } from '@/features/community-report';

type Props = {
  report: CommunityFloodReport;
  onClose: () => void;
};

export function CommunityReportCard({ report, onClose }: Props) {
  const created = report.createdAt
    ? new Date(report.createdAt).toLocaleString('vi-VN')
    : '—';

  const severityLabel = (() => {
    const raw = String(report.severity ?? '')
      .trim()
      .toLowerCase();
    if (!raw) return null;
    const map: Record<string, string> = {
      low: 'Thấp',
      medium: 'Trung bình',
      high: 'Cao'
    };
    return map[raw] ?? report.severity;
  })();

  const statusLabel = (() => {
    const raw = String(report.status ?? '')
      .trim()
      .toLowerCase();
    if (!raw) return null;
    const map: Record<string, string> = {
      visible: 'Đang hiển thị',
      show: 'Đang hiển thị',
      displayed: 'Đang hiển thị',
      hidden: 'Đã ẩn',
      hide: 'Đã ẩn'
    };
    return map[raw] ?? report.status;
  })();

  return (
    <div className='pointer-events-auto w-full max-w-xs'>
      <div className='bg-card text-card-foreground overflow-hidden rounded-2xl border shadow-xl'>
        <div className='flex items-start justify-between gap-2 border-b px-4 py-3'>
          <div className='min-w-0'>
            <h3 className='text-base font-bold'>Phản ánh cộng đồng</h3>
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
            {severityLabel && (
              <>
                <dt className='text-muted-foreground'>Mức độ</dt>
                <dd className='font-medium'>{severityLabel}</dd>
              </>
            )}
            {statusLabel && (
              <>
                <dt className='text-muted-foreground'>Trạng thái</dt>
                <dd>{statusLabel}</dd>
              </>
            )}
            {report.trustScore != null && (
              <>
                <dt className='text-muted-foreground'>Điểm tin cậy</dt>
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
