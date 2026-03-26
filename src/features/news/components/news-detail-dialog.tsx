'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import type { Announcement } from '@/features/news/types/news.type';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Target,
  Clock,
  Globe,
  Eye,
  CheckCircle,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  announcementData: Announcement;
};

function formatDate(dateString: string | null) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function NewsDetailDialog({
  open,
  onOpenChange,
  announcementData
}: Props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const statusConfig: Record<
    string,
    {
      label: string;
      variant: 'default' | 'secondary' | 'outline';
      className: string;
      icon: typeof Globe;
    }
  > = {
    draft: {
      label: 'Bản nháp',
      variant: 'outline',
      className: 'bg-gray-500/10 text-gray-600',
      icon: AlertCircle
    },
    pending: {
      label: 'Chờ đăng',
      variant: 'default',
      className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      icon: Clock
    },
    published: {
      label: 'Đã đăng',
      variant: 'default',
      className: 'bg-green-500/10 text-green-700 dark:text-green-400',
      icon: Globe
    },
    cancelled: {
      label: 'Đã hủy',
      variant: 'outline',
      className: 'bg-red-500/10 text-red-700 dark:text-red-400',
      icon: AlertCircle
    }
  };

  const priorityConfig: Record<string, { label: string; className: string }> = {
    low: { label: 'Thấp', className: 'bg-gray-500/10 text-gray-600' },
    normal: {
      label: 'Bình thường',
      className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
    },
    high: {
      label: 'Cao',
      className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400'
    },
    urgent: {
      label: 'Khẩn cấp',
      className: 'bg-red-500/10 text-red-700 dark:text-red-400'
    }
  };

  const status = statusConfig[announcementData.status] ?? {
    label: announcementData.status,
    variant: 'outline' as const,
    className: '',
    icon: AlertCircle
  };
  const priority = priorityConfig[announcementData.priority] ?? {
    label: announcementData.priority,
    className: ''
  };
  const StatusIcon = status.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='pr-6 text-lg leading-tight font-semibold'>
            {announcementData.title}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className='space-y-3'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-2/3' />
            <Skeleton className='h-4 w-1/2' />
          </div>
        ) : (
          <div className='space-y-4 text-sm'>
            {/* Badges */}
            <div className='flex flex-wrap gap-2'>
              <Badge
                variant={status.variant}
                className={`gap-1.5 ${status.className}`}
              >
                <StatusIcon className='h-3.5 w-3.5' />
                {status.label}
              </Badge>
              <Badge
                variant='outline'
                className={`gap-1.5 ${priority.className}`}
              >
                <AlertTriangle className='h-3.5 w-3.5' />
                {priority.label}
              </Badge>
            </div>

            {/* Summary */}
            {announcementData.summary && (
              <div className='bg-muted/50 text-muted-foreground rounded-md p-3'>
                {announcementData.summary}
              </div>
            )}

            {/* Content */}
            {announcementData.content && (
              <div className='space-y-1.5'>
                <h4 className='text-base font-semibold'>Nội dung</h4>
                <div
                  className='prose prose-sm dark:prose-invert max-w-none'
                  dangerouslySetInnerHTML={{ __html: announcementData.content }}
                />
              </div>
            )}

            {/* Image Preview */}
            {announcementData.imageUrl && (
              <div className='space-y-1.5'>
                <h4 className='text-base font-semibold'>Hình ảnh</h4>
                <img
                  src={announcementData.imageUrl}
                  alt={announcementData.title}
                  className='max-h-48 rounded-md border object-cover'
                />
              </div>
            )}

            {/* Metadata Grid */}
            <div className='grid grid-cols-2 gap-4 rounded-md border p-3'>
              <div className='space-y-1'>
                <div className='text-muted-foreground flex items-center gap-1.5'>
                  <User className='h-3.5 w-3.5' />
                  <span className='text-xs font-medium'>Tác giả</span>
                </div>
                <div className='font-medium'>{announcementData.authorName}</div>
              </div>

              <div className='space-y-1'>
                <div className='text-muted-foreground flex items-center gap-1.5'>
                  <Target className='h-3.5 w-3.5' />
                  <span className='text-xs font-medium'>Đối tượng</span>
                </div>
                <div className='font-medium'>
                  {announcementData.target === 'all'
                    ? 'Tất cả'
                    : announcementData.target === 'region'
                      ? `Khu vực: ${announcementData.targetValue || '—'}`
                      : `Vai trò: ${announcementData.targetValue || '—'}`}
                </div>
              </div>

              <div className='space-y-1'>
                <div className='text-muted-foreground flex items-center gap-1.5'>
                  <Clock className='h-3.5 w-3.5' />
                  <span className='text-xs font-medium'>Lịch đăng</span>
                </div>
                <div>{formatDate(announcementData.scheduledAt)}</div>
              </div>

              <div className='space-y-1'>
                <div className='text-muted-foreground flex items-center gap-1.5'>
                  <Globe className='h-3.5 w-3.5' />
                  <span className='text-xs font-medium'>Đã đăng lúc</span>
                </div>
                <div>{formatDate(announcementData.publishedAt)}</div>
              </div>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-3 gap-3'>
              <div className='flex items-center gap-2 rounded-md border p-2.5'>
                <Eye className='text-muted-foreground h-4 w-4' />
                <div>
                  <div className='text-muted-foreground text-xs'>Lượt xem</div>
                  <div className='font-semibold'>
                    {announcementData.viewCount}
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2 rounded-md border p-2.5'>
                <CheckCircle className='text-muted-foreground h-4 w-4' />
                <div>
                  <div className='text-muted-foreground text-xs'>Đã gửi</div>
                  <div className='font-semibold'>
                    {announcementData.deliveryCount}
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2 rounded-md border p-2.5'>
                <AlertCircle className='text-muted-foreground h-4 w-4' />
                <div>
                  <div className='text-muted-foreground text-xs'>Đã đọc</div>
                  <div className='font-semibold'>
                    {announcementData.readCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {announcementData.attachments && (
              <div className='space-y-1.5'>
                <h4 className='text-base font-semibold'>Tệp đính kèm</h4>
                <div className='text-muted-foreground'>
                  {(() => {
                    try {
                      const urls = JSON.parse(announcementData.attachments);
                      return (
                        <ul className='list-inside list-disc space-y-1'>
                          {Array.isArray(urls) ? (
                            urls.map((url, i) => (
                              <li key={i}>
                                <a
                                  href={url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-primary underline underline-offset-2'
                                >
                                  {url}
                                </a>
                              </li>
                            ))
                          ) : (
                            <li>{announcementData.attachments}</li>
                          )}
                        </ul>
                      );
                    } catch {
                      return <span>{announcementData.attachments}</span>;
                    }
                  })()}
                </div>
              </div>
            )}

            {/* Created */}
            <div className='text-muted-foreground border-t pt-3 text-xs'>
              Tạo lúc: {formatDate(announcementData.createdAt)}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
