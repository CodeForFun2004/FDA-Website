'use client';

import * as React from 'react';
import { Badge, Button, Card, CardContent } from '@/components/ui/common';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Eye,
  EyeOff,
  Film,
  Image as ImageIcon,
  Loader2,
  MapPin
} from 'lucide-react';
import type {
  CommunityFloodReport,
  CommunityFloodReportMedia,
  CommunityReporterProfile
} from '../types/community-report.type';

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function severityLabel(value?: string | null) {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized === '1' || normalized === 'medium') return 'Trung bình';
  if (normalized === '2' || normalized === 'low') return 'Thấp';
  if (normalized === '3' || normalized === 'high') return 'Cao';
  return value ? String(value) : '—';
}

function statusLabel(value?: string | null) {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized === 'published' || normalized === '1') return 'Đang hiển thị';
  if (normalized === 'hidden' || normalized === '2') return 'Đã ẩn';
  return value || '—';
}

function severityBadgeClass(value?: string | null) {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized === '2' || normalized === 'low') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
  if (normalized === '1' || normalized === 'medium') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }
  if (normalized === '3' || normalized === 'high') {
    return 'border-red-200 bg-red-50 text-red-700';
  }
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function statusBadgeClass(value?: string | null) {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized === 'published' || normalized === '1') {
    return 'border-blue-200 bg-blue-50 text-blue-700';
  }
  if (normalized === 'hidden' || normalized === '2') {
    return 'border-slate-200 bg-slate-100 text-slate-700';
  }
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function InfoItem({
  label,
  value,
  mono = false
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className='rounded-xl border bg-slate-50 px-3 py-2.5'>
      <div className='text-xs text-slate-500'>{label}</div>
      <div
        className={`mt-1 text-sm text-slate-900 ${mono ? 'font-mono break-all' : 'break-words whitespace-normal'}`}
      >
        {value}
      </div>
    </div>
  );
}

function MediaPreviewDialog({
  open,
  onOpenChange,
  media,
  title
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media?: CommunityFloodReportMedia;
  title: string;
}) {
  const mediaUrl = media?.mediaUrl || media?.thumbnailUrl || '';
  const isVideo = (media?.mediaType ?? '').toLowerCase() === 'video';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Xem tệp đính kèm</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>

        {!mediaUrl ? (
          <div className='text-muted-foreground py-8 text-center text-sm'>
            Không có tệp để xem.
          </div>
        ) : isVideo ? (
          <video
            src={mediaUrl}
            controls
            className='max-h-[70vh] w-full rounded-xl bg-black'
          />
        ) : (
          <img
            src={mediaUrl}
            alt='Tệp đính kèm phản ánh'
            className='max-h-[70vh] w-full rounded-xl object-contain'
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

type Props = {
  report: CommunityFloodReport;
  hiding: boolean;
  onHide: () => void;
  reporterUsersMap?: Map<string, CommunityReporterProfile>;
};

export function CommunityReportCard({
  report,
  hiding,
  onHide,
  reporterUsersMap
}: Props) {
  const mediaList = (report.media ?? []).filter(
    (item) => item.thumbnailUrl || item.mediaUrl
  );
  const [selectedMediaIndex, setSelectedMediaIndex] = React.useState(0);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  React.useEffect(() => {
    setSelectedMediaIndex(0);
  }, [report.id]);

  const preview = mediaList[selectedMediaIndex];
  const previewUrl = preview?.thumbnailUrl || preview?.mediaUrl || '';
  const isVideo = (preview?.mediaType ?? '').toLowerCase() === 'video';
  const isAlreadyHidden =
    String(report.status ?? '').toLowerCase() === 'hidden' ||
    String(report.status ?? '') === '2';

  return (
    <>
      <Card className='overflow-hidden'>
        <CardContent className='p-0'>
          <div className='grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)]'>
            <div className='bg-slate-50'>
              {previewUrl ? (
                <div className='space-y-2 p-2'>
                  <button
                    type='button'
                    className='group relative block w-full overflow-hidden rounded-xl'
                    onClick={() => setPreviewOpen(true)}
                  >
                    {isVideo ? (
                      <video
                        src={preview.mediaUrl || ''}
                        className='h-[220px] w-full object-cover'
                        muted
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt='Ảnh phản ánh ngập'
                        className='h-[220px] w-full object-cover transition group-hover:scale-[1.01]'
                      />
                    )}
                    <div className='absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white'>
                      <Eye className='h-3 w-3' />
                      Xem lớn
                    </div>
                  </button>

                  {mediaList.length > 1 && (
                    <div className='grid grid-cols-4 gap-2'>
                      {mediaList.map((media, index) => {
                        const thumb =
                          media.thumbnailUrl || media.mediaUrl || '';
                        const mediaIsVideo =
                          (media.mediaType ?? '').toLowerCase() === 'video';

                        return (
                          <button
                            key={media.id}
                            type='button'
                            onClick={() => setSelectedMediaIndex(index)}
                            className={`relative overflow-hidden rounded-lg border ${
                              selectedMediaIndex === index
                                ? 'border-primary ring-primary/20 ring-2'
                                : 'border-slate-200'
                            }`}
                          >
                            {mediaIsVideo ? (
                              <div className='relative'>
                                <video
                                  src={media.mediaUrl || ''}
                                  className='h-16 w-full object-cover'
                                  muted
                                />
                                <div className='absolute inset-0 flex items-center justify-center bg-black/20'>
                                  <Film className='h-4 w-4 text-white' />
                                </div>
                              </div>
                            ) : (
                              <img
                                src={thumb}
                                alt={`Media ${index + 1}`}
                                className='h-16 w-full object-cover'
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className='text-muted-foreground flex min-h-[220px] items-center justify-center gap-2 text-sm'>
                  <ImageIcon className='h-4 w-4' />
                  Không có ảnh
                </div>
              )}
            </div>

            <div className='space-y-4 p-5'>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='space-y-2'>
                  <div className='flex flex-wrap gap-2'>
                    <Badge
                      variant='outline'
                      className={severityBadgeClass(report.severity)}
                    >
                      Mức độ: {severityLabel(report.severity)}
                    </Badge>
                    <Badge
                      variant='outline'
                      className={statusBadgeClass(report.status)}
                    >
                      {statusLabel(report.status)}
                    </Badge>
                    {report.trustScore != null && (
                      <Badge variant='outline'>
                        Điểm tin cậy: {report.trustScore}
                      </Badge>
                    )}
                    {report.score != null && (
                      <Badge variant='outline'>Điểm: {report.score}</Badge>
                    )}
                  </div>
                  <div className='flex items-start gap-2 text-sm'>
                    <MapPin className='mt-0.5 h-4 w-4 shrink-0 text-slate-500' />
                    <div>
                      <div className='font-medium text-slate-900'>
                        {report.address || 'Chưa có địa chỉ'}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        {report.latitude}, {report.longitude}
                      </div>
                      <div className='text-muted-foreground mt-1 text-xs'>
                        Gửi lúc: {formatDateTime(report.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  type='button'
                  variant='destructive'
                  size='sm'
                  className='gap-2 text-white'
                  disabled={hiding || isAlreadyHidden}
                  onClick={onHide}
                >
                  {hiding ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Đang ẩn...
                    </>
                  ) : (
                    <>
                      <EyeOff className='h-4 w-4' />
                      {isAlreadyHidden ? 'Đã ẩn' : 'Ẩn bài'}
                    </>
                  )}
                </Button>
              </div>

              <div>
                <div className='text-sm font-semibold text-slate-900'>
                  Nội dung phản ánh
                </div>
                <p className='mt-1 text-sm leading-6 text-slate-700'>
                  {report.description || 'Không có mô tả.'}
                </p>
              </div>

              <div className='grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4'>
                <InfoItem
                  label='Người gửi'
                  value={
                    report.reporterName ||
                    report.reporterEmail ||
                    (report.reporterUserId
                      ? reporterUsersMap?.get(String(report.reporterUserId))
                          ?.name ||
                        reporterUsersMap?.get(String(report.reporterUserId))
                          ?.email
                      : undefined) ||
                    'Không rõ'
                  }
                  mono
                />
                <InfoItem
                  label='Mức tin cậy'
                  value={
                    report.confidenceLevel != null
                      ? String(report.confidenceLevel)
                      : '—'
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <MediaPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        media={preview}
        title={report.address || 'Phản ánh cộng đồng'}
      />
    </>
  );
}
