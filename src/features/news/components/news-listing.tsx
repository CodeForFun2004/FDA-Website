'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Announcement } from '@/features/news/types/news.type';
import { newsApi } from '@/features/news/api/news.api';
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await newsApi.getAnnouncements({
        page: 1,
        pageSize: 20
      });

      setData(response.data);
      setTotalItems(response.totalCount);
    } catch (error: any) {
      setError(error.message || 'Không thể tải danh sách thông báo');
      setData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, []);

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
        <div className='text-muted-foreground'>
          Đang tải danh sách thông báo...
        </div>
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
