'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Announcement } from '@/features/news/types/news.type';
import { newsApi } from '@/features/news/api/news.api';
import { useQueryState, parseAsInteger, parseAsString } from 'nuqs';
import { NewsTable } from './news-tables';
import { getNewsColumns } from './news-tables/columns';

type NewsListingPageProps = {
  refreshSignal?: number;
};

export default function NewsListingPage({
  refreshSignal = 0
}: NewsListingPageProps) {
  const [data, setData] = useState<Announcement[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [sort] = useQueryState('sort', parseAsString.withDefault('')) as [
    any,
    any
  ];
  const [title] = useQueryState('title', parseAsString.withDefault(''));
  const [status] = useQueryState('status', parseAsString.withDefault(''));
  const [priority] = useQueryState('priority', parseAsString.withDefault(''));

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let sortBy, sortOrder;
      const getSortByField = (id: string) => {
        if (id === 'publishedAt') return 'published_at';
        return id;
      };

      if (sort) {
        if (Array.isArray(sort)) {
          if (sort.length > 0) {
            sortBy = getSortByField(sort[0].id);
            sortOrder = sort[0].desc ? 'desc' : 'asc';
          }
        } else if (typeof sort === 'string') {
          if (sort.startsWith('[')) {
            try {
              const parsed = JSON.parse(sort);
              if (Array.isArray(parsed) && parsed.length > 0) {
                sortBy = getSortByField(parsed[0].id);
                sortOrder = parsed[0].desc ? 'desc' : 'asc';
              }
            } catch {
              // ignore
            }
          } else if (sort.includes('.')) {
            const [field, order] = sort.split('.');
            sortBy = getSortByField(field);
            sortOrder = order;
          }
        }
      }

      const response = await newsApi.getAnnouncements({
        page,
        pageSize,
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc' | undefined,
        search: title || undefined,
        status: (status as any) || undefined,
        priority: (priority as any) || undefined
      });

      setData(response.data);
      setTotalItems(response.totalCount);
    } catch (error: any) {
      setError(error.message || 'Failed to load announcements');
      setData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sort, title, status, priority]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey, refreshSignal]);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const tableColumns = useMemo(
    () => getNewsColumns(handleRefresh),
    [handleRefresh]
  );

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-muted-foreground'>Đang tải thông báo…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-destructive text-center'>
          <div className='mb-1 font-medium'>Lỗi</div>
          <div className='text-sm'>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <NewsTable
      data={data}
      totalItems={totalItems}
      columns={tableColumns}
      onRefresh={handleRefresh}
    />
  );
}
