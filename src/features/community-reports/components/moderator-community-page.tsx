'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/common';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiFetch } from '@/libs/api/client';
import {
  fetchCommunityFloodReportsPaged,
  type CommunityFloodReportMedia,
  hideCommunityFloodReport,
  type CommunityFloodReport,
  type CommunityFloodReportsQuery
} from '@/features/zones/api/flood-reports-community.api';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  Film,
  Image as ImageIcon,
  Loader2,
  MapPin,
  RefreshCw
} from 'lucide-react';

const PAGE_SIZE = 10;

type Filters = {
  status: '' | 'published' | 'hidden';
  severity: '' | 'low' | 'medium' | 'high';
  minTrustScore: string;
  from: string;
  to: string;
};

const DEFAULT_FILTERS: Filters = {
  status: '',
  severity: '',
  minTrustScore: '',
  from: '',
  to: ''
};

function buildQuery(
  filters: Filters,
  pageNumber: number
): CommunityFloodReportsQuery {
  // BE dùng dạng chuỗi: status=published|hidden, severity=low|medium|high
  const statusCode = filters.status === '' ? null : filters.status;

  const severityCode = filters.severity === '' ? null : filters.severity;

  return {
    status: statusCode,
    severity: severityCode,
    minTrustScore:
      filters.minTrustScore.trim() === ''
        ? null
        : Number(filters.minTrustScore),
    from: filters.from || '',
    to: filters.to || '',
    pageNumber,
    pageSize: PAGE_SIZE
  };
}

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
  const v = String(value ?? '').toLowerCase();
  if (v === '1' || v === 'medium') return 'Trung bình';
  if (v === '2' || v === 'low') return 'Thấp';
  if (v === '3' || v === 'high') return 'Cao';
  return value ? String(value) : '—';
}

function statusLabel(value?: string | null) {
  const v = String(value ?? '').toLowerCase();
  if (v === 'published' || v === '1') return 'Đang hiển thị';
  if (v === 'hidden' || v === '2') return 'Đã ẩn';
  return value || '—';
}

function severityBadgeClass(value?: string | null) {
  const v = String(value ?? '').toLowerCase();
  if (v === '2' || v === 'low')
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (v === '1' || v === 'medium')
    return 'border-amber-200 bg-amber-50 text-amber-700';
  if (v === '3' || v === 'high') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function statusBadgeClass(value?: string | null) {
  const v = String(value ?? '').toLowerCase();
  if (v === 'published' || v === '1')
    return 'border-blue-200 bg-blue-50 text-blue-700';
  if (v === 'hidden' || v === '2')
    return 'border-slate-200 bg-slate-100 text-slate-700';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

export default function ModeratorCommunityPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS);
  const [pageNumber, setPageNumber] = React.useState(1);

  const queryParams = React.useMemo(
    () => buildQuery(filters, pageNumber),
    [filters, pageNumber]
  );

  const reportsQuery = useQuery({
    queryKey: ['moderator-community-reports', queryParams],
    queryFn: () => fetchCommunityFloodReportsPaged(queryParams)
  });

  const hideMutation = useMutation({
    mutationFn: (reportId: string) => hideCommunityFloodReport(reportId),
    onSuccess: () => {
      toast.success('Đã ẩn bài phản ánh');
      queryClient.invalidateQueries({
        queryKey: ['moderator-community-reports']
      });
    },
    onError: (error: Error) => {
      toast.error('Ẩn bài thất bại', {
        description: error.message
      });
    }
  });

  const items = reportsQuery.data?.items ?? [];
  const reporterUserIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const r of items) {
      if (r.reporterUserId) ids.add(String(r.reporterUserId));
    }
    return Array.from(ids);
  }, [items]);

  const reporterUsersQuery = useQuery({
    queryKey: ['moderator-community-reporters', reporterUserIds.join(',')],
    enabled: reporterUserIds.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const normalizeUser = (
        raw: unknown
      ): { name?: string; email?: string } => {
        const o = (raw ?? {}) as Record<string, any>;
        const u = (o.user ?? o.data ?? o) as Record<string, any>;
        const name =
          u.fullName ?? u.name ?? u.userName ?? u.username ?? u.displayName;
        const email = u.email;
        return {
          name: typeof name === 'string' ? name : undefined,
          email: typeof email === 'string' ? email : undefined
        };
      };

      const entries = await Promise.all(
        reporterUserIds.map(async (id) => {
          try {
            const raw = await apiFetch<unknown>(`/users/${id}`, {
              method: 'GET'
            });
            return [id, normalizeUser(raw)] as const;
          } catch {
            return [id, {}] as const;
          }
        })
      );

      return new Map(entries);
    }
  });

  const totalCount = reportsQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const updateFilters = <K extends keyof Filters>(
    key: K,
    value: Filters[K]
  ) => {
    setPageNumber(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setPageNumber(1);
    setFilters(DEFAULT_FILTERS);
  };

  const handleHide = async (report: CommunityFloodReport) => {
    const statusRaw = String(report.status ?? '').toLowerCase();
    if (statusRaw === 'hidden' || String(report.status ?? '') === '2') return;
    const ok = window.confirm('Bạn có chắc muốn ẩn bài phản ánh này không?');
    if (!ok) return;
    await hideMutation.mutateAsync(report.id);
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardContent className='flex flex-wrap items-center justify-between gap-3 p-4'>
          <div>
            <div className='text-sm font-semibold text-slate-900'>
              Lọc nhanh theo trạng thái
            </div>
            <div className='text-muted-foreground text-sm'>
              Chuyển nhanh giữa bài đang hiển thị và bài đã ẩn.
            </div>
          </div>
          <Tabs
            value={filters.status || 'tat-ca'}
            onValueChange={(value) =>
              updateFilters(
                'status',
                value === 'tat-ca' ? '' : (value as Filters['status'])
              )
            }
          >
            <TabsList className='h-auto flex-wrap'>
              <TabsTrigger value='tat-ca'>Tất cả</TabsTrigger>
              <TabsTrigger value='published'>Đang hiển thị</TabsTrigger>
              <TabsTrigger value='hidden'>Đã ẩn</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-4'>
          <CardTitle className='text-lg'>Bộ lọc phản ánh cộng đồng</CardTitle>
          <CardDescription>
            Lọc theo trạng thái, mức độ, điểm tin cậy và khoảng ngày gửi bài.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-3 md:grid-cols-2 xl:grid-cols-5'>
          <div className='space-y-1.5'>
            <div className='text-sm font-medium'>Trạng thái</div>
            <Select
              value={filters.status || 'tat-ca'}
              onValueChange={(value) =>
                updateFilters(
                  'status',
                  value === 'tat-ca' ? '' : (value as Filters['status'])
                )
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Chọn trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='tat-ca'>Tất cả</SelectItem>
                <SelectItem value='published'>Đang hiển thị</SelectItem>
                <SelectItem value='hidden'>Đã ẩn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <div className='text-sm font-medium'>Mức độ</div>
            <Select
              value={filters.severity || 'tat-ca'}
              onValueChange={(value) =>
                updateFilters(
                  'severity',
                  value === 'tat-ca' ? '' : (value as Filters['severity'])
                )
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Chọn mức độ' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='tat-ca'>Tất cả</SelectItem>
                <SelectItem value='low'>Thấp</SelectItem>
                <SelectItem value='medium'>Trung bình</SelectItem>
                <SelectItem value='high'>Cao</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <div className='text-sm font-medium'>Điểm tin cậy tối thiểu</div>
            <Input
              type='number'
              min='0'
              step='1'
              placeholder='Ví dụ: 1'
              value={filters.minTrustScore}
              onChange={(e) => updateFilters('minTrustScore', e.target.value)}
            />
          </div>

          <div className='space-y-1.5'>
            <div className='text-sm font-medium'>Từ ngày</div>
            <Input
              type='date'
              value={filters.from}
              onChange={(e) => updateFilters('from', e.target.value)}
            />
          </div>

          <div className='space-y-1.5'>
            <div className='text-sm font-medium'>Đến ngày</div>
            <Input
              type='date'
              value={filters.to}
              onChange={(e) => updateFilters('to', e.target.value)}
            />
          </div>

          <div className='flex flex-wrap gap-2 pt-1 md:col-span-2 xl:col-span-5'>
            <Button
              type='button'
              variant='outline'
              onClick={() => reportsQuery.refetch()}
              disabled={reportsQuery.isFetching}
              className='gap-2'
            >
              <RefreshCw
                className={`h-4 w-4 ${reportsQuery.isFetching ? 'animate-spin' : ''}`}
              />
              Tải lại
            </Button>
            <Button type='button' variant='ghost' onClick={resetFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className='flex items-center justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold'>Danh sách phản ánh</h2>
          <p className='text-muted-foreground text-sm'>
            Tổng cộng {totalCount} bài phản ánh.
          </p>
        </div>
        <Badge variant='outline' className='rounded-full px-3 py-1 text-sm'>
          Trang {pageNumber}/{totalPages}
        </Badge>
      </div>

      {reportsQuery.isLoading ? (
        <div className='flex items-center justify-center rounded-2xl border bg-white py-16'>
          <div className='text-muted-foreground flex items-center gap-2 text-sm'>
            <Loader2 className='h-4 w-4 animate-spin' />
            Đang tải danh sách phản ánh...
          </div>
        </div>
      ) : reportsQuery.isError ? (
        <Card>
          <CardContent className='py-12 text-center'>
            <p className='text-sm font-medium text-red-600'>
              Không tải được danh sách phản ánh cộng đồng.
            </p>
            <p className='text-muted-foreground mt-1 text-sm'>
              {reportsQuery.error instanceof Error
                ? reportsQuery.error.message
                : 'Lỗi không xác định'}
            </p>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className='py-12 text-center'>
            <p className='text-sm font-medium'>
              Không có bài phản ánh phù hợp.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4'>
          {items.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              hiding={
                hideMutation.isPending && hideMutation.variables === report.id
              }
              onHide={() => void handleHide(report)}
              reporterUsersMap={reporterUsersQuery.data}
            />
          ))}
        </div>
      )}

      <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4'>
        <div className='text-muted-foreground text-sm'>
          Hiển thị {(pageNumber - 1) * PAGE_SIZE + (items.length ? 1 : 0)}-
          {(pageNumber - 1) * PAGE_SIZE + items.length} / {totalCount} bài.
        </div>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            disabled={pageNumber <= 1 || reportsQuery.isFetching}
            onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
          >
            Trang trước
          </Button>
          <Button
            type='button'
            variant='outline'
            disabled={pageNumber >= totalPages || reportsQuery.isFetching}
            onClick={() =>
              setPageNumber((prev) => Math.min(totalPages, prev + 1))
            }
          >
            Trang sau
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReportCard({
  report,
  hiding,
  onHide,
  reporterUsersMap
}: {
  report: CommunityFloodReport;
  hiding: boolean;
  onHide: () => void;
  reporterUsersMap?: Map<string, { name?: string; email?: string }>;
}) {
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
                      // eslint-disable-next-line @next/next/no-img-element
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
                              // eslint-disable-next-line @next/next/no-img-element
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
                  className='gap-2'
                  disabled={
                    hiding ||
                    String(report.status ?? '').toLowerCase() === 'hidden' ||
                    String(report.status ?? '') === '2'
                  }
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
                      {String(report.status ?? '').toLowerCase() === 'hidden' ||
                      String(report.status ?? '') === '2'
                        ? 'Đã ẩn'
                        : 'Ẩn bài'}
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
          // eslint-disable-next-line @next/next/no-img-element
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
        className={`mt-1 text-sm text-slate-900 ${mono ? 'font-mono break-all' : ''}`}
      >
        {value}
      </div>
    </div>
  );
}
