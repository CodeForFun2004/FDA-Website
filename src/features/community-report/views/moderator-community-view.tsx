'use client';

import * as React from 'react';
import { Badge, Card, CardContent } from '@/components/ui/common';
import { Loader2 } from 'lucide-react';
import { CommunityReportCard } from '../components/community-report-card';
import { CommunityReportFilters } from '../components/community-report-filters';
import { CommunityReportHideDialog } from '../components/community-report-hide-dialog';
import { CommunityReportPagination } from '../components/community-report-pagination';
import {
  useCommunityReporterProfiles,
  useHideCommunityReport,
  useModeratorCommunityReports
} from '../hooks/useCommunityReports';
import type {
  CommunityFloodReport,
  CommunityFloodReportsQuery,
  ModeratorCommunityFilters
} from '../types/community-report.type';

const DEFAULT_PAGE_SIZE = 10;

const DEFAULT_FILTERS: ModeratorCommunityFilters = {
  status: '',
  severity: '',
  minTrustScore: '',
  from: '',
  to: ''
};

function buildQuery(
  filters: ModeratorCommunityFilters,
  pageNumber: number,
  pageSize: number
): CommunityFloodReportsQuery {
  return {
    status: filters.status === '' ? null : filters.status,
    severity: filters.severity === '' ? null : filters.severity,
    minTrustScore:
      filters.minTrustScore.trim() === ''
        ? null
        : Number(filters.minTrustScore),
    from: filters.from || '',
    to: filters.to || '',
    pageNumber,
    pageSize
  };
}

export function ModeratorCommunityView() {
  const [filters, setFilters] =
    React.useState<ModeratorCommunityFilters>(DEFAULT_FILTERS);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [hideConfirmOpen, setHideConfirmOpen] = React.useState(false);
  const [pendingHideReport, setPendingHideReport] =
    React.useState<CommunityFloodReport | null>(null);

  const queryParams = React.useMemo(
    () => buildQuery(filters, pageNumber, pageSize),
    [filters, pageNumber, pageSize]
  );

  const reportsQuery = useModeratorCommunityReports(queryParams);
  const hideMutation = useHideCommunityReport();

  const items = reportsQuery.data?.items ?? [];
  const reporterUsersQuery = useCommunityReporterProfiles(items);

  const totalCount = reportsQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const appliedFiltersCount = React.useMemo(() => {
    let count = 0;
    if (filters.severity) count += 1;
    if (filters.minTrustScore.trim()) count += 1;
    if (filters.from) count += 1;
    if (filters.to) count += 1;
    return count;
  }, [filters]);

  const goToPage = (nextPage: number) => {
    const safePage = Math.min(totalPages, Math.max(1, nextPage));
    setPageNumber(safePage);
  };

  const updateFilters = <K extends keyof ModeratorCommunityFilters>(
    key: K,
    value: ModeratorCommunityFilters[K]
  ) => {
    setPageNumber(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setPageNumber(1);
    setFilters(DEFAULT_FILTERS);
  };

  const handleHide = (report: CommunityFloodReport) => {
    const statusRaw = String(report.status ?? '').toLowerCase();
    if (statusRaw === 'hidden' || String(report.status ?? '') === '2') return;

    setPendingHideReport(report);
    setHideConfirmOpen(true);
  };

  return (
    <div className='space-y-4'>
      <CommunityReportHideDialog
        report={pendingHideReport}
        open={hideConfirmOpen}
        isPending={hideMutation.isPending}
        onClose={() => {
          if (hideMutation.isPending) return;
          setHideConfirmOpen(false);
          setPendingHideReport(null);
        }}
        onConfirm={async () => {
          if (!pendingHideReport) return;
          try {
            await hideMutation.mutateAsync(pendingHideReport.id);
          } finally {
            setHideConfirmOpen(false);
            setPendingHideReport(null);
          }
        }}
      />

      <CommunityReportFilters
        filters={filters}
        filtersOpen={filtersOpen}
        appliedFiltersCount={appliedFiltersCount}
        isFetching={reportsQuery.isFetching}
        onToggleFilters={() => setFiltersOpen((value) => !value)}
        onReload={() => void reportsQuery.refetch()}
        onReset={resetFilters}
        onUpdateFilter={updateFilters}
      />

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
            <CommunityReportCard
              key={report.id}
              report={report}
              hiding={
                hideMutation.isPending && hideMutation.variables === report.id
              }
              onHide={() => handleHide(report)}
              reporterUsersMap={reporterUsersQuery.data}
            />
          ))}
        </div>
      )}

      <CommunityReportPagination
        totalCount={totalCount}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPages={totalPages}
        onChangePageSize={(nextSize) => {
          setPageNumber(1);
          setPageSize(nextSize);
        }}
        onGoToPage={goToPage}
      />
    </div>
  );
}
