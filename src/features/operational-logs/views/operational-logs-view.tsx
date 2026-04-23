'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import type {
  OperationalLogListItem,
  OperationalLogsQueryParams
} from '../types';
import { getOperationalLogDetail, getOperationalLogs } from '../api';
import {
  OperationalLogDetailDrawer,
  OperationalLogsExportButtons,
  OperationalLogsTable
} from '../components';
import { useDataTable } from '@/hooks/use-data-table';
import { getOperationalLogsColumns } from '../components/operational-logs-table/columns';

const EMPTY_ROLES: string[] = [];

function isAuthorityRole(roles: string[]) {
  return roles.includes('AUTHORITY');
}

function pickFirst(v: unknown) {
  if (Array.isArray(v)) return v[0];
  return v;
}

function toIsoFromMs(ms: unknown) {
  const n = typeof ms === 'string' ? Number(ms) : (ms as number);
  if (!n || Number.isNaN(n)) return undefined;
  const d = new Date(n);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function buildApiParams(args: {
  tableState: {
    pagination: { pageIndex: number; pageSize: number };
    sorting: Array<{ id: string; desc: boolean }>;
    columnFilters: Array<{ id: string; value: unknown }>;
  };
}): OperationalLogsQueryParams {
  const { pagination, sorting, columnFilters } = args.tableState;

  const sort = sorting?.[0];
  const sortId = sort?.id ?? 'createdAt';
  const orderBy: OperationalLogsQueryParams['orderBy'] =
    sortId === 'createdAt'
      ? 'CreatedAt'
      : sortId === 'level'
        ? 'Level'
        : sortId === 'category'
          ? 'Category'
          : sortId === 'action'
            ? 'Action'
            : 'CreatedAt';

  const filters = Object.fromEntries(columnFilters.map((f) => [f.id, f.value]));

  const createdAtRange = (filters as any).createdAtRange;
  const createdAtArr = Array.isArray(createdAtRange) ? createdAtRange : [];

  const searchTextValue = (filters as any).searchText;
  const searchText = Array.isArray(searchTextValue)
    ? searchTextValue.join(' ')
    : typeof searchTextValue === 'string'
      ? searchTextValue
      : undefined;

  return {
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize ?? 10,
    orderBy,
    orderDescending: sort?.desc ?? true,
    searchText: searchText?.trim() || undefined,
    category: (pickFirst((filters as any).category) as any) || undefined,
    level: (pickFirst((filters as any).level) as any) || undefined,
    fromDate: toIsoFromMs(createdAtArr[0]),
    toDate: toIsoFromMs(createdAtArr[1])
  };
}

export default function OperationalLogsView() {
  const roles = useAuthStore((s) => s.user?.roles ?? EMPTY_ROLES);
  const isAuthority = isAuthorityRole(roles);

  const columns = React.useMemo(
    () => getOperationalLogsColumns({ isAuthority }),
    [isAuthority]
  );

  const [rows, setRows] = React.useState<OperationalLogListItem[]>([]);
  const [totalItems, setTotalItems] = React.useState(0);
  const [pageCount, setPageCount] = React.useState(1);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const { table } = useDataTable({
    data: rows,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnVisibility: {
        searchText: false,
        createdAtRange: false
      },
      sorting: [{ id: 'createdAt', desc: true }]
    }
  });

  const apiParams = buildApiParams({ tableState: table.getState() as any });
  const exportParams: OperationalLogsQueryParams = React.useMemo(() => {
    const { page, pageSize, ...rest } = apiParams;
    return rest;
  }, [apiParams]);

  const listQuery = useQuery({
    queryKey: [
      'operational-logs',
      apiParams.page,
      apiParams.pageSize,
      apiParams.orderBy,
      apiParams.orderDescending,
      apiParams.searchText ?? '',
      apiParams.category ?? '',
      apiParams.level ?? '',
      apiParams.fromDate ?? '',
      apiParams.toDate ?? ''
    ],
    queryFn: async () => {
      const res = await getOperationalLogs(apiParams);
      return res.data;
    }
  });

  const detailQuery = useQuery({
    queryKey: ['operational-log-detail', selectedId],
    enabled: !!selectedId && detailOpen,
    queryFn: async () => {
      if (!selectedId) return { notFound: true as const };
      return await getOperationalLogDetail(selectedId);
    }
  });

  React.useEffect(() => {
    if (!listQuery.isError) return;
    const msg =
      (listQuery.error as any)?.message ?? 'Không thể tải nhật ký vận hành.';
    toast.error(msg);
  }, [listQuery.isError, listQuery.error]);

  React.useEffect(() => {
    if (!listQuery.data) return;
    const raw = (listQuery.data.items ?? []) as OperationalLogListItem[];
    const filtered = isAuthority
      ? raw.filter(
          (x) => x.category !== 'system' && x.category !== 'moderation'
        )
      : raw;
    setRows(filtered);
    setTotalItems(listQuery.data.totalCount ?? 0);
    setPageCount(
      Math.max(
        1,
        listQuery.data.totalPages ??
          Math.ceil(
            (listQuery.data.totalCount ?? 0) / (apiParams.pageSize ?? 10)
          )
      )
    );
  }, [listQuery.data, isAuthority, apiParams.pageSize]);

  const pageItems = React.useMemo(() => {
    return rows.reduce(
      (acc, x) => {
        if (x.level === 'info') acc.info += 1;
        if (x.level === 'warning') acc.warning += 1;
        if (x.level === 'error') acc.error += 1;
        return acc;
      },
      { info: 0, warning: 0, error: 0 }
    );
  }, [rows]);

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h1 className='text-2xl font-bold tracking-tight'>Logs Hệ Thống</h1>
          <div className='mt-2 flex flex-wrap items-center gap-2 text-sm'>
            <span className='text-muted-foreground'>Tổng</span>
            <Badge variant='outline' className='bg-muted/20'>
              {totalItems}
            </Badge>
            <span className='text-muted-foreground'>bản ghi</span>
            <Badge variant='outline' className='bg-slate-100 text-slate-700'>
              Thông tin {pageItems.info}
            </Badge>
            <Badge variant='outline' className='bg-amber-50 text-amber-800'>
              Cảnh báo {pageItems.warning}
            </Badge>
            <Badge variant='outline' className='bg-red-50 text-red-700'>
              Lỗi {pageItems.error}
            </Badge>
          </div>
        </div>

        <OperationalLogsExportButtons params={exportParams} />
      </div>

      <OperationalLogsTable
        table={table}
        loading={listQuery.isFetching && rows.length === 0}
        onOpenDetail={(id) => {
          setSelectedId(id);
          setDetailOpen(true);
        }}
      />

      <OperationalLogDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        notFound={detailQuery.data?.notFound ?? false}
        log={
          detailQuery.data && !detailQuery.data.notFound
            ? detailQuery.data.data
            : null
        }
      />
    </div>
  );
}
